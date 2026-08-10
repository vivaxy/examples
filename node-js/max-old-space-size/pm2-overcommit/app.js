import http from 'http';
import v8 from 'v8';

const PORT = Number(process.env.PORT) || 3000;
const CHUNK_MB = Number(process.env.CHUNK_MB) || 50;
const CHURN = Number(process.env.CHURN ?? 3);
const CYCLE_MS = Number(process.env.CYCLE_MS) || 500;
// 0 = unlimited (standalone V8 OOM demo); >0 = grow to target then hold
const TARGET_MB = Number(process.env.TARGET_MB) || 0;

// Packed double array = 8 B/elem, so CHUNK_MB MB = this many elements.
const ELEMENTS_PER_CHUNK = Math.round((CHUNK_MB * 1024 * 1024) / 8);
const chunks = [];

const mb = (b) => Math.round(b / 1048576);
const id = process.env.NODE_APP_INSTANCE ?? '0';
const { heap_size_limit } = v8.getHeapStatistics();
const limitMB = mb(heap_size_limit);

// TARGET_CHUNKS: chunk count to reach before holding. Infinity = never hold.
const TARGET_CHUNKS =
  TARGET_MB > 0 ? Math.ceil(TARGET_MB / CHUNK_MB) : Infinity;
let reachedTarget = false;

console.log(
  `[${id}] pid ${process.pid} heap_size_limit=${limitMB} MB` +
    (TARGET_MB > 0 ? ` target=${TARGET_MB} MB (${TARGET_CHUNKS} chunks)` : ''),
);

const server = http.createServer((req, res) => {
  if (req.url === '/stats') {
    const { used_heap_size, heap_size_limit: hsl } = v8.getHeapStatistics();
    const { rss } = process.memoryUsage();
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        instance: id,
        pid: process.pid,
        heapUsedMB: mb(used_heap_size),
        heapLimitMB: mb(hsl),
        targetMB: TARGET_MB,
        rssMB: mb(rss),
        chunks: chunks.length,
      }),
    );
  } else {
    res.end(`instance ${id} pid ${process.pid}\n`);
  }
});

async function run() {
  while (true) {
    // Grow only until target chunk count; then hold (churn only, no net growth).
    // reachedTarget is a one-way flag — GC dips in heapUsed must not re-trigger growth.
    if (!reachedTarget) {
      chunks.push(new Array(ELEMENTS_PER_CHUNK).fill(0));
      if (chunks.length >= TARGET_CHUNKS) {
        reachedTarget = true;
      }
    }
    for (let i = 0; i < CHURN; i++) {
      if (chunks.length > 0) {
        chunks.shift();
        chunks.push(new Array(ELEMENTS_PER_CHUNK).fill(0));
      }
    }
    const { used_heap_size } = v8.getHeapStatistics();
    const { rss } = process.memoryUsage();
    const phase = reachedTarget ? 'HOLD' : 'GROW';
    console.log(
      `[${id}] ${phase} heapUsed=${mb(used_heap_size)}/${limitMB} MB` +
        (TARGET_MB > 0 ? ` (target ${TARGET_MB})` : '') +
        ` | rss=${mb(rss)} MB | chunks=${chunks.length}`,
    );
    await new Promise((r) => setTimeout(r, CYCLE_MS));
  }
}

server.listen(PORT, run);
