// Measures GC overhead under different heap size limits.
//
// A 200-entry circular cache keeps ~20 MB of objects alive in old generation.
// With a small heap (64 MB) that 20 MB creates steady old-gen pressure, so V8
// runs Major GC (MarkCompact via incremental marking) aggressively. With a
// large heap (512 MB) the same 20 MB is negligible — Major GC barely fires.
//
// Compare:
//   node --max-old-space-size=64  gc-overhead.js
//   node --max-old-space-size=512 gc-overhead.js

import { PerformanceObserver, performance, constants } from 'perf_hooks';
import v8 from 'v8';

const ITERATIONS = 2000;
// 25 K elements × ~4 bytes (pointer compression) ≈ 100 KB per cache entry
const ELEMENTS_PER_ENTRY = 25 * 1024;
// 200 × 100 KB ≈ 20 MB working set kept alive throughout the run
const CACHE_SIZE = 200;

// V8 GC kind values surfaced via PerformanceObserver.
// Modern V8 routes all Major GC through the incremental marking pipeline, so
// the stop-the-world MarkCompact phase is reported as kind=4 (MajorGC), not
// kind=2. kind=2 only appears when GC is forced without incremental marking
// (e.g. via global.gc() with --expose-gc).
const GC_KIND = {
  [constants.NODE_PERFORMANCE_GC_MINOR]: 'MinorGC', // 1
  [constants.NODE_PERFORMANCE_GC_FLAGS_CONSTRUCT_RETAINED]: 'ConstructRetained', // 2
  [constants.NODE_PERFORMANCE_GC_MAJOR]: 'MajorGC', // 4
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: 'IncrementalGC', // 8
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: 'WeakCB', // 16
  [constants.NODE_PERFORMANCE_GC_FLAGS_ALL_EXTERNAL_MEMORY]:
    'AllExternalMemory', // 32
  [constants.NODE_PERFORMANCE_GC_FLAGS_SCHEDULE_IDLE]: 'ScheduleIdle', // 64
};

async function main() {
  const { heap_size_limit } = v8.getHeapStatistics();
  console.log(
    `heap_size_limit: ${Math.round(heap_size_limit / 1024 / 1024)} MB`,
  );

  const counts = {};
  const times = {};

  function recordEntries(entries) {
    for (const entry of entries) {
      const k = entry.detail?.kind ?? 0;
      counts[k] = (counts[k] || 0) + 1;
      times[k] = (times[k] || 0) + entry.duration;
    }
  }

  const obs = new PerformanceObserver((list) =>
    recordEntries(list.getEntries()),
  );
  obs.observe({ entryTypes: ['gc'], buffered: true });

  // Circular buffer: overwriting a slot releases the old entry to be collected.
  const cache = new Array(CACHE_SIZE);
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    cache[i % CACHE_SIZE] = new Array(ELEMENTS_PER_ENTRY).fill(i);
  }
  const elapsed = performance.now() - start;

  // Two-phase yield: setImmediate lets the observer queue its entries, then
  // setTimeout(0) lets the observer callback actually fire and deliver them.
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setTimeout(resolve, 0));
  obs.disconnect();

  let totalGcMs = 0;
  for (const ms of Object.values(times)) totalGcMs += ms;

  console.log(`iterations:  ${ITERATIONS}`);
  console.log(`elapsed:     ${Math.round(elapsed)} ms`);
  console.log(`gc total:    ${Math.round(totalGcMs)} ms`);
  console.log(`gc share:    ${Math.round((totalGcMs / elapsed) * 100)}%`);
  console.log(`gc breakdown:`);
  for (const k of Object.keys(counts).sort()) {
    const name = (GC_KIND[k] ?? `kind${k}`).padEnd(12);
    console.log(
      `  ${name} count=${counts[k]}  time=${Math.round(times[k])} ms`,
    );
  }
}

main();
