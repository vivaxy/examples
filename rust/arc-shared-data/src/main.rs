use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::Arc;
use std::sync::RwLock;
use std::sync::atomic::{AtomicI64, Ordering};
use std::thread;
use std::time::Instant;

/// Total number of f64 cells across all regions (~76.3 MiB).
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

/// A nested composite object tree:
/// `Dataset` → `Vec<Region>` → `{ String name, Vec<f64> cells }`.
#[derive(Clone)]
struct Region {
  name: String,
  cells: Vec<f64>,
}

#[derive(Clone)]
struct Dataset {
  name: String,
  regions: Vec<Region>,
}

/// Shared across threads through one `Arc`.
///
/// The heavy nested `dataset` stays immutable; only the small write-back
/// target gets interior mutability, so readers never contend on a lock.
struct Shared {
  dataset: Dataset,
  /// Each thread writes its total into its own slot — cross-thread mutation.
  sums: RwLock<Vec<f64>>,
}

impl Dataset {
  fn sum(&self) -> f64 {
    self.regions.iter().flat_map(|r| r.cells.iter()).sum()
  }
}

fn build_dataset(regions: usize) -> Dataset {
  let cells_per_region = DATA_LEN / regions;
  let mut offset = 0;
  let regions = (0..regions)
    .map(|i| {
      let cells = (offset..offset + cells_per_region)
        .map(|i| (i % 1000) as f64 * 0.5)
        .collect();
      offset += cells_per_region;
      Region {
        name: format!("region-{:04}", i),
        cells,
      }
    })
    .collect();
  Dataset {
    name: "shared-dataset".to_string(),
    regions,
  }
}

fn verify(sums: &[f64]) -> f64 {
  let checksum = sums[0];
  assert!(
    sums.iter().all(|s| *s == checksum),
    "threads computed different sums"
  );
  checksum
}

/// One round of the clone scenario: deep-clone the whole nested tree per
/// thread (every `Vec<Region>`, `String`, and `Vec<f64>` copied), then sum.
/// Returns (copy_ms, compute_ms, checksum).
fn clone_round(dataset: &Dataset, threads: usize) -> (u128, u128, f64) {
  let started = Instant::now();
  let copies: Vec<_> = (0..threads).map(|_| dataset.clone()).collect();
  let copy_ms = started.elapsed().as_millis();

  let started = Instant::now();
  let handles: Vec<_> = copies
    .into_iter()
    .map(|dataset| thread::spawn(move || dataset.sum()))
    .collect();
  let sums: Vec<_> = handles.into_iter().map(|h| h.join().unwrap()).collect();
  let compute_ms = started.elapsed().as_millis();
  (copy_ms, compute_ms, verify(&sums))
}

/// One round of the Arc scenario: share the tree via refcount bumps, sum it
/// read-only, and write the result back through the shared `RwLock`.
/// Returns (compute_ms, checksum).
fn arc_round(shared: &Arc<Shared>, threads: usize) -> (u128, f64) {
  let started = Instant::now();
  let handles: Vec<_> = (0..threads)
    .map(|i| {
      let shared = Arc::clone(shared);
      thread::spawn(move || {
        let sum = shared.dataset.sum();
        shared.sums.write().unwrap()[i] = sum;
        sum
      })
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
  let dataset = build_dataset(threads);
  let cells: usize = dataset.regions.iter().map(|r| r.cells.len()).sum();
  let data_bytes = (cells * 8) as i64;

  println!(
    "Dataset: {} ({} .. {}) — {} regions x {} f64 cells = {:.1} MiB",
    dataset.name,
    dataset.regions.first().unwrap().name,
    dataset.regions.last().unwrap().name,
    threads,
    cells / threads,
    mib(data_bytes)
  );
  println!("Threads: {}", threads);
  println!("Rounds per scenario: {}", ROUNDS);

  // Scenario A: every thread gets its own deep copy of the nested tree.
  let (stats, clone_peak) = measure(|| {
    let mut copy = Vec::with_capacity(ROUNDS);
    let mut compute = Vec::with_capacity(ROUNDS);
    let mut checksum = 0.0;
    for _ in 0..ROUNDS {
      let (c, t, sum) = clone_round(&dataset, threads);
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

  // Scenario B: share one nested tree through Arc clones (refcount bumps
  // only), and mutate the inner `sums` slot through a fine-grained RwLock.
  let (stats, arc_peak) = measure(|| {
    let shared = Arc::new(Shared {
      dataset,
      sums: RwLock::new(vec![0.0; threads]),
    });
    let mut compute = Vec::with_capacity(ROUNDS);
    let mut checksum = 0.0;
    for _ in 0..ROUNDS {
      let (t, sum) = arc_round(&shared, threads);
      compute.push(t);
      checksum = sum;
    }
    let sums = shared.sums.read().unwrap().clone();
    assert_eq!(sums, vec![checksum; threads], "write-back slots diverged");
    (compute, checksum)
  });
  let (arc_compute, arc_checksum) = stats;
  assert_eq!(
    clone_checksum, arc_checksum,
    "scenarios computed different sums"
  );
  println!();
  println!("Arc share + RwLock write-back:");
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
