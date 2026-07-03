// Buffer.alloc and Uint8Array back their data with native C++ memory.
// That memory does NOT count against --max-old-space-size.
//
// Run with a low heap limit — the allocations succeed far beyond the limit:
//   node --max-old-space-size=128 native-memory.js

import v8 from 'v8';

const CHUNK_MB = 50;
const TOTAL_MB = 600;
const buffers = [];

async function main() {
  const { heap_size_limit } = v8.getHeapStatistics();
  console.log(
    `heap_size_limit: ${Math.round(heap_size_limit / 1024 / 1024)} MB`,
  );
  console.log(
    `Allocating ${TOTAL_MB} MB via Buffer.alloc (${
      TOTAL_MB / CHUNK_MB
    } × ${CHUNK_MB} MB chunks)...`,
  );

  let allocated = 0;
  while (allocated < TOTAL_MB) {
    buffers.push(Buffer.alloc(CHUNK_MB * 1024 * 1024));
    allocated += CHUNK_MB;
    const { used_heap_size } = v8.getHeapStatistics();
    const { rss } = process.memoryUsage();
    console.log(
      `native: ${allocated} MB | heapUsed: ${Math.round(
        used_heap_size / 1024 / 1024,
      )} MB / ${Math.round(
        heap_size_limit / 1024 / 1024,
      )} MB limit | rss: ${Math.round(rss / 1024 / 1024)} MB`,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  console.log('Done — no heap OOM despite allocating far beyond the limit.');
}

main();
