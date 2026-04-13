/**
 * @since 2026-04-13
 * @author vivaxy
 *
 * Koa server for Event Loop Delay benchmark.
 *
 * Usage:
 *   node server.js            # baseline mode (no monitoring)
 *   node server.js --monitor  # monitor mode (monitorEventLoopDelay enabled)
 *
 * Endpoints:
 *   GET /          - main request handler (runs both middlewares)
 *   GET /ping      - lightweight mock backend for the network request middleware
 *   GET /metrics   - returns server CPU and memory usage snapshot
 */

'use strict';

const http = require('http');
const { monitorEventLoopDelay } = require('perf_hooks');
const Koa = require('koa');

const MONITOR_ENABLED = process.argv.includes('--monitor');
const PORT = Number(process.env.PORT) || 3000;
const MOCK_PORT = Number(process.env.MOCK_PORT) || 3001;

// ── Event Loop Delay monitor setup ──────────────────────────────────────────

let histogram = null;
if (MONITOR_ENABLED) {
  histogram = monitorEventLoopDelay();
  histogram.enable();
}

// ── CPU-intensive computation ────────────────────────────────────────────────

// Busy-loop that runs real arithmetic for ~20 ms, simulating CPU-bound work.
function cpuBusyWork(targetMs = 20) {
  const end = Date.now() + targetMs;
  let result = 0;
  while (Date.now() < end) {
    // inner batch: enough work to avoid Date.now() dominating the loop
    for (let i = 0; i < 5000; i++) {
      result += Math.sqrt(i) * Math.log(i + 1);
    }
  }
  return result;
}

// ── Mock backend server ──────────────────────────────────────────────────────

// Simulates a real downstream service with ~100 ms latency.
const mockServer = http.createServer((req, res) => {
  setTimeout(() => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('pong');
  }, 100);
});

// ── Middleware: async network request ────────────────────────────────────────

async function networkMiddleware(ctx, next) {
  const res = await fetch(`http://127.0.0.1:${MOCK_PORT}/ping`);
  ctx.state.mockBody = await res.text();
  await next();
}

// ── Middleware: CPU-intensive computation ────────────────────────────────────

async function cpuMiddleware(ctx, next) {
  ctx.state.cpuResult = cpuBusyWork(20);
  await next();
}

// ── Koa app ──────────────────────────────────────────────────────────────────

const app = new Koa();

app.use(networkMiddleware);
app.use(cpuMiddleware);

const nsToMs = (ns) => ns / 1e6;

// Main response handler
app.use(async (ctx) => {
  const body = {
    mode: MONITOR_ENABLED ? 'monitor' : 'baseline',
    cpuResult: ctx.state.cpuResult,
  };
  if (histogram) {
    body.eventLoopDelay = {
      min: nsToMs(histogram.min),
      mean: nsToMs(histogram.mean),
      p50: nsToMs(histogram.percentile(50)),
      p90: nsToMs(histogram.percentile(90)),
      p99: nsToMs(histogram.percentile(99)),
      max: nsToMs(histogram.max),
    };
    histogram.reset();
  }
  ctx.body = body;
});

// ── /metrics route (handled before Koa to keep it lightweight) ───────────────

let lastCpuUsage = process.cpuUsage();
let lastCpuTime = Date.now();

const mainServer = http.createServer((req, res) => {
  if (req.url === '/metrics') {
    const now = Date.now();
    const cpu = process.cpuUsage(lastCpuUsage);
    const elapsed = (now - lastCpuTime) * 1000; // µs
    const cpuPercent =
      elapsed > 0 ? ((cpu.user + cpu.system) / elapsed) * 100 : 0;
    lastCpuUsage = process.cpuUsage();
    lastCpuTime = now;

    const mem = process.memoryUsage();
    const payload = JSON.stringify({
      cpu: { percent: cpuPercent.toFixed(2), ...cpu },
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
      },
    });
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(payload);
    return;
  }
  app.callback()(req, res);
});

// ── Startup ───────────────────────────────────────────────────────────────────

mockServer.listen(MOCK_PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`Mock backend listening on http://127.0.0.1:${MOCK_PORT}`);
});

mainServer.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(
    `Koa server listening on http://127.0.0.1:${PORT} [mode: ${
      MONITOR_ENABLED ? 'monitor' : 'baseline'
    }]`,
  );
});
