// Measures GC overhead under different heap size limits.
//
// A 200-entry circular cache keeps ~20 MB of objects alive in old generation.
// With a small heap that 20 MB is a large fraction of the limit, so V8 runs
// incremental marking aggressively. With a large heap it is a small fraction,
// so incremental marking barely runs.
//
// Compare:
//   node --max-old-space-size=64  gc-overhead.js
//   node --max-old-space-size=512 gc-overhead.js

import { PerformanceObserver, performance } from 'perf_hooks';
import v8 from 'v8';

const ITERATIONS = 2000;
// 25 K elements × ~4 bytes (pointer compression) ≈ 100 KB per cache entry
const ELEMENTS_PER_ENTRY = 25 * 1024;
// 200 × 100 KB ≈ 20 MB working set kept alive throughout the run
const CACHE_SIZE = 200;

// V8 GC kind values surfaced via PerformanceObserver
const GC_KIND = {
  1: 'Scavenge',
  2: 'MarkCompact',
  4: 'Incremental',
  8: 'Weak',
};

async function main() {
  const { heap_size_limit } = v8.getHeapStatistics();
  console.log(
    `heap_size_limit: ${Math.round(heap_size_limit / 1024 / 1024)} MB`,
  );

  const counts = {};
  const times = {};

  const obs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const k = entry.detail?.kind ?? 0;
      counts[k] = (counts[k] || 0) + 1;
      times[k] = (times[k] || 0) + entry.duration;
    }
  });
  obs.observe({ entryTypes: ['gc'], buffered: true });

  // Circular buffer: overwriting a slot releases the old entry to be collected.
  const cache = new Array(CACHE_SIZE);
  const start = performance.now();
  for (let i = 0; i < ITERATIONS; i++) {
    cache[i % CACHE_SIZE] = new Array(ELEMENTS_PER_ENTRY).fill(i);
  }
  const elapsed = performance.now() - start;

  // Yield once so PerformanceObserver can flush all pending GC entries.
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
