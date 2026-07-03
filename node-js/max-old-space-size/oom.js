import v8 from 'v8';

// 1 M elements per chunk; each V8 pointer slot is ~4–8 bytes (pointer compression
// dependent), so each chunk occupies ~4–8 MB of old-generation heap.
const ELEMENTS_PER_CHUNK = 1024 * 1024;
const chunks = [];

async function main() {
  const { heap_size_limit } = v8.getHeapStatistics();
  console.log(
    `heap_size_limit: ${Math.round(heap_size_limit / 1024 / 1024)} MB`,
  );

  while (true) {
    chunks.push(new Array(ELEMENTS_PER_CHUNK).fill(1));
    const { used_heap_size } = v8.getHeapStatistics();
    console.log(
      `used_heap_size: ${Math.round(used_heap_size / 1024 / 1024)} MB`,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

main();
