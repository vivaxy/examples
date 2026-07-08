// Shows when Node.js / V8 fires its first MAJOR (Mark-Compact) garbage
// collection — the old-generation GC — and lets you shift that moment with V8
// flags.
//
// Allocates ~1 MiB arrays (large enough to be placed in old space) and retains
// them in a sliding window, so old space fills with live data plus dead
// promoted objects awaiting collection. A PerformanceObserver watches `gc`
// entries; when the first Mark-Compact fires, the script prints at what
// allocation / heap state V8 decided to major-GC, and why.
//
// A buffered PerformanceObserver delivers entries asynchronously, so we keep a
// per-iteration timeline (performance.now() + used_heap_size) and correlate
// each GC entry's startTime against it to recover the real iteration and
// before/after heap — not just the nearest yield boundary.
//
// Change the first major-GC moment with V8 flags — see README.md:
//   node --initial-old-space-size=4 first-gc/index.js   # much earlier
//   node --initial-old-space-size=64 first-gc/index.js  # later
//   node --gc-global first-gc/index.js                  # first GC = Mark-Compact
//
// Script option: --keep-going  keep allocating, print each GC (not just first).

import { PerformanceObserver, performance, constants } from 'perf_hooks';
import v8 from 'v8';

const K_MINOR = constants.NODE_PERFORMANCE_GC_MINOR; // 1
const K_MAJOR = constants.NODE_PERFORMANCE_GC_MAJOR; // 4

const GC_LABEL = {
  [constants.NODE_PERFORMANCE_GC_MINOR]: 'Scavenge',
  [constants.NODE_PERFORMANCE_GC_MAJOR]: 'Mark-Compact',
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'Incremental marking',
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'Weak callbacks',
};

const CHUNK_ELEMENTS = 131072; // ~1 MiB (DOUBLE array, 8 B/elem) → old space
const CHUNK_BYTES = CHUNK_ELEMENTS * 8;
const WINDOW = 40; // retain the last N chunks (~40 MiB live); release older ones
const YIELD_EVERY = 16; // iterations between event-loop yields
const MAX_ITERATIONS = 20_000; // safety cap
const MAX_MAJORS_KEEP_GOING = 5;
const keepGoing = process.argv.includes('--keep-going');

const kb = (bytes) => {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KiB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MiB';
};
const group = (n) => n.toLocaleString('en-US');

// Per-iteration timeline for correlating GC entry.startTime → iteration / heap.
const samples = []; // { iter, bytes, t, used }, increasing t
const window = [];
let iterations = 0;
let bytesAllocated = 0;
const initialHeap = v8.getHeapStatistics();
const gcLog = []; // { kind, duration, startTime }

const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    gcLog.push({
      kind: entry.detail?.kind ?? 0,
      duration: entry.duration,
      startTime: entry.startTime,
    });
  }
});
obs.observe({ entryTypes: ['gc'], buffered: true });

// Largest index whose sample.t <= target (samples are sorted by t).
function sampleIndexAt(target) {
  let lo = 0;
  let hi = samples.length - 1;
  let ans = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (samples[mid].t <= target) {
      ans = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return ans;
}

async function main() {
  console.log('=== First Major GC detector ===');
  console.log(
    `Chunk: ~${kb(CHUNK_BYTES)} (${CHUNK_ELEMENTS} elems, → old space)` +
      `  ·  live window: ${WINDOW} chunks (~${kb(WINDOW * CHUNK_BYTES)})` +
      `  ·  keep-going: ${keepGoing ? 'on' : 'off'}`,
  );
  console.log(
    `Heap (initial):  used = ${kb(initialHeap.used_heap_size)}` +
      `  heap_size = ${kb(initialHeap.total_heap_size)}` +
      `  limit = ${kb(initialHeap.heap_size_limit)}`,
  );
  console.log('Allocating into old space…\n');

  const firstMajor = () =>
    gcLog
      .filter((g) => g.kind === K_MAJOR)
      .sort((a, b) => a.startTime - b.startTime)[0];
  const majors = () =>
    gcLog
      .filter((g) => g.kind === K_MAJOR)
      .sort((a, b) => a.startTime - b.startTime);
  const stop = () =>
    keepGoing
      ? majors().length >= MAX_MAJORS_KEEP_GOING
      : firstMajor() !== undefined;

  while (!stop() && iterations < MAX_ITERATIONS) {
    window.push(new Array(CHUNK_ELEMENTS).fill(iterations));
    if (window.length > WINDOW) window.shift(); // release oldest → dead in old space
    iterations++;
    bytesAllocated = iterations * CHUNK_BYTES;
    samples.push({
      iter: iterations,
      bytes: bytesAllocated,
      t: performance.now(),
      used: v8.getHeapStatistics().used_heap_size,
    });
    if (iterations % YIELD_EVERY === 0) {
      await new Promise((r) => setImmediate(r)); // let buffered GC entries deliver
    }
  }

  // Two-phase flush (per gc-overhead.js): setImmediate queues, setTimeout(0)
  // lets the observer callback actually fire before we disconnect.
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 0));
  obs.disconnect();

  if (gcLog.length === 0) {
    console.log('No GC observed within the iteration cap.');
    return;
  }

  if (keepGoing) {
    let lastT = -Infinity;
    let n = 0;
    for (const g of majors()) {
      n++;
      const idx = sampleIndexAt(g.startTime);
      const before = samples[idx].used;
      const after = samples[idx + 1]?.used;
      const s = samples[idx];
      const minorsBetween = gcLog.filter(
        (m) =>
          m.kind === K_MINOR &&
          m.startTime > lastT &&
          m.startTime < g.startTime,
      ).length;
      console.log(
        `[#${n} Mark-Compact]  iter=${group(s.iter)}  ~${kb(s.bytes)}` +
          `  used ${before != null ? kb(before) : '?'} → ${
            after != null ? kb(after) : '?'
          }` +
          `  (+${minorsBetween} minor GCs since last major)`,
      );
      lastT = g.startTime;
    }
    return;
  }

  const fm = firstMajor();
  if (!fm) {
    console.log('No Mark-Compact fired within the iteration cap.');
    console.log(`GCs seen: ${gcLog.length} (all minor/incremental).`);
    return;
  }

  const idx = sampleIndexAt(fm.startTime);
  const before = samples[idx].used;
  const after = samples[idx + 1]?.used;
  const s = samples[idx];
  const minors = gcLog.filter(
    (g) => g.startTime < fm.startTime && g.kind === K_MINOR,
  ).length;

  console.log('=== First Major (Mark-Compact) GC fired ===');
  console.log(`GC kind:     Mark-Compact  [kind=${K_MAJOR}]`);
  console.log(`Duration:    ${fm.duration.toFixed(2)} ms`);
  console.log(
    `Fired at:    iteration ${group(s.iter)}  ·  ~${kb(
      s.bytes,
    )} allocated (cumulative)`,
  );
  console.log(
    `Heap before: used = ${
      before != null ? kb(before) : '?'
    }  (last sample before GC)`,
  );
  console.log(
    `Heap after:  used = ${
      after != null ? kb(after) : '?'
    }  (first sample after GC)`,
  );
  console.log(
    `Minor GCs before this: ${minors}  (Scavenges in young generation)`,
  );
  console.log(
    `=> V8 fired a major GC because old space reached its reclamation trigger` +
      ` — set by --initial-old-space-size (smaller → fires earlier).`,
  );
}

main();
