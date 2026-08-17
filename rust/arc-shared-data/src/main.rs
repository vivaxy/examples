use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::Arc;
use std::sync::atomic::{AtomicI64, Ordering};
use std::thread;
use std::time::Instant;

/// Number of f64 elements in the dataset (10M * 8 bytes = ~76.3 MiB).
const DATA_LEN: usize = 10_000_000;

/// Timing rounds per scenario, reported individually and averaged.
const ROUNDS: usize = 5;

static ALLOCATED: AtomicI64 = AtomicI64::new(0);
static PEAK: AtomicI64 = AtomicI64::new(0);

/// Global allocator wrapper that tracks live and peak allocated bytes.
/// Only atomic operations here — no printing or allocating (recursion hazard).
struct CountingAlloc;

unsafe impl GlobalAlloc for CountingAlloc {
  unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
    let ptr = unsafe { System.alloc(layout) };
    if !ptr.is_null() {
      let size = layout.size() as i64;
      let cur = ALLOCATED.fetch_add(size, Ordering::Relaxed) + size;
      let mut peak = PEAK.load(Ordering::Relaxed);
      while cur > peak {
        match PEAK.compare_exchange_weak(peak, cur, Ordering::Relaxed, Ordering::Relaxed) {
          Ok(_) => break,
          Err(actual) => peak = actual,
        }
      }
    }
    ptr
  }

  unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
    ALLOCATED.fetch_sub(layout.size() as i64, Ordering::Relaxed);
    unsafe { System.dealloc(ptr, layout) };
  }
}

#[global_allocator]
static GLOBAL: CountingAlloc = CountingAlloc;

/// Run `f`, returning its result plus the peak total allocated bytes observed
/// while `f` ran (the tracker starts at the live-bytes baseline).
fn measure<T>(f: impl FnOnce() -> T) -> (T, i64) {
  let baseline = ALLOCATED.load(Ordering::Relaxed);
  PEAK.store(baseline, Ordering::Relaxed);
  let result = f();
  (result, PEAK.load(Ordering::Relaxed))
}

fn mib(bytes: i64) -> f64 {
  bytes as f64 / 1024.0 / 1024.0
}

fn build_dataset() -> Vec<f64> {
  (0..DATA_LEN).map(|i| (i % 1000) as f64 * 0.5).collect()
}

fn verify(sums: &[f64]) -> f64 {
  let checksum = sums[0];
  assert!(
    sums.iter().all(|s| *s == checksum),
    "threads computed different sums"
  );
  checksum
}

/// One round of the clone scenario: copy the dataset per thread, then sum.
/// Returns (copy_ms, compute_ms, checksum).
fn clone_round(data: &[f64], threads: usize) -> (u128, u128, f64) {
  let started = Instant::now();
  let copies: Vec<_> = (0..threads).map(|_| data.to_vec()).collect();
  let copy_ms = started.elapsed().as_millis();

  let started = Instant::now();
  let handles: Vec<_> = copies
    .into_iter()
    .map(|data| thread::spawn(move || data.iter().sum::<f64>()))
    .collect();
  let sums: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
  let compute_ms = started.elapsed().as_millis();
  (copy_ms, compute_ms, verify(&sums))
}

/// One round of the Arc scenario: share the dataset, then sum.
/// Returns (compute_ms, checksum).
fn arc_round(shared: &Arc<Vec<f64>>, threads: usize) -> (u128, f64) {
  let started = Instant::now();
  let handles: Vec<_> = (0..threads)
    .map(|_| {
      let shared = Arc::clone(shared);
      thread::spawn(move || shared.iter().sum::<f64>())
    })
    .collect();
  let sums: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
  (started.elapsed().as_millis(), verify(&sums))
}

fn avg(values: &[u128]) -> f64 {
  values.iter().sum::<u128>() as f64 / values.len() as f64
}

fn main() {
  let threads = thread::available_parallelism()
    .map(|n| n.get())
    .unwrap_or(4);
  let data = build_dataset();
  let data_bytes = (DATA_LEN * 8) as i64;

  println!("Dataset: {} f64 = {:.1} MiB", DATA_LEN, mib(data_bytes));
  println!("Threads: {}", threads);
  println!("Rounds per scenario: {}", ROUNDS);

  // Scenario A: every thread gets its own copy of the dataset.
  let (stats, clone_peak) = measure(|| {
    let mut copy = Vec::with_capacity(ROUNDS);
    let mut compute = Vec::with_capacity(ROUNDS);
    let mut checksum = 0.0;
    for _ in 0..ROUNDS {
      let (c, t, sum) = clone_round(&data, threads);
      copy.push(c);
      compute.push(t);
      checksum = sum;
    }
    (copy, compute, checksum)
  });
  let (clone_copy, clone_compute, clone_checksum) = stats;
  println!();
  println!("clone per thread:");
  println!("  peak memory: {:.1} MiB", mib(clone_peak));
  println!("  checksum:    {}", clone_checksum);
  for round in 0..ROUNDS {
    println!(
      "  round {}: copy {} ms | compute {} ms | total {} ms",
      round + 1,
      clone_copy[round],
      clone_compute[round],
      clone_copy[round] + clone_compute[round]
    );
  }
  let clone_total = avg(&clone_copy) + avg(&clone_compute);
  println!(
    "  average: copy {:.1} ms | compute {:.1} ms | total {:.1} ms",
    avg(&clone_copy),
    avg(&clone_compute),
    clone_total
  );

  // Scenario B: share one dataset through Arc clones (refcount bumps only).
  let (stats, arc_peak) = measure(|| {
    let shared = Arc::new(data);
    let mut compute = Vec::with_capacity(ROUNDS);
    let mut checksum = 0.0;
    for _ in 0..ROUNDS {
      let (t, sum) = arc_round(&shared, threads);
      compute.push(t);
      checksum = sum;
    }
    (compute, checksum)
  });
  let (arc_compute, arc_checksum) = stats;
  assert_eq!(
    clone_checksum, arc_checksum,
    "scenarios computed different sums"
  );
  println!();
  println!("Arc share:");
  println!("  peak memory: {:.1} MiB", mib(arc_peak));
  println!("  checksum:    {}", arc_checksum);
  for round in 0..ROUNDS {
    println!("  round {}: compute {} ms", round + 1, arc_compute[round]);
  }
  let arc_total = avg(&arc_compute);
  println!("  average: compute {:.1} ms", arc_total);

  println!();
  println!(
    "Arc share was {:.1}x faster on average ({:.1} ms -> {:.1} ms), peaking at {:.1} MiB instead of {:.1} MiB.",
    clone_total / arc_total,
    clone_total,
    arc_total,
    mib(arc_peak),
    mib(clone_peak)
  );
}
