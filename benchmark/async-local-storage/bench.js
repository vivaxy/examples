/**
 * @since 2026-04-13
 * @author vivaxy
 *
 * AsyncLocalStorage overhead benchmark.
 *
 * Starts the Koa server in baseline and ALS modes, then runs autocannon at
 * several concurrency levels to compare:
 *   - Requests/sec (QPS)
 *   - Latency (p50 / p99 / avg) in ms
 *   - CPU and heap memory usage (sampled from /metrics)
 *
 * Usage:
 *   node bench.js
 */

'use strict';

const { spawn } = require('child_process');
const autocannon = require('autocannon');

const SERVER_PORT = 3000;
const MOCK_PORT = 3001;
const SERVER_URL = `http://127.0.0.1:${SERVER_PORT}`;
const DURATION_SECS = 10; // seconds per run
const CONCURRENCY_LEVELS = [5, 10, 50];

// ── Utilities ─────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Poll /metrics until the server is up, with a timeout.
 */
async function waitForServer(timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${SERVER_URL}/metrics`);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await sleep(100);
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}

/**
 * Fetch CPU/memory snapshot from the running server.
 */
async function fetchMetrics() {
  try {
    const res = await fetch(`${SERVER_URL}/metrics`);
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Start server.js as a child process.
 * @param {boolean} alsEnabled
 * @returns {{ proc: ChildProcess, kill: () => void }}
 */
function startServer(alsEnabled) {
  const args = ['server.js'];
  if (alsEnabled) args.push('--als');
  const proc = spawn(process.execPath, args, {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: String(SERVER_PORT),
      MOCK_PORT: String(MOCK_PORT),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  proc.stderr.on('data', (d) => process.stderr.write(`[server:err] ${d}`));
  return {
    proc,
    kill: () => {
      proc.kill('SIGTERM');
    },
  };
}

/**
 * Run autocannon against the server at a given concurrency.
 * @returns {object} autocannon result
 */
function runAutocannon(connections) {
  return new Promise((resolve, reject) => {
    const instance = autocannon(
      {
        url: SERVER_URL,
        connections,
        duration: DURATION_SECS,
        pipelining: 1,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      },
    );
    autocannon.track(instance, { renderProgressBar: false });
  });
}

/**
 * Collect metrics once before and once after the autocannon run, return avg.
 */
async function sampleMetrics(runFn) {
  await fetchMetrics(); // reset the delta window
  const result = await runFn();
  const metrics = await fetchMetrics();
  return { result, metrics };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function bench(alsEnabled) {
  const label = alsEnabled ? 'ALS' : 'Baseline';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Running: ${label} mode`);
  console.log('='.repeat(60));

  const server = startServer(alsEnabled);
  await waitForServer();

  const rows = [];

  for (const connections of CONCURRENCY_LEVELS) {
    process.stdout.write(
      `  concurrency=${connections}  duration=${DURATION_SECS}s ... `,
    );
    const { result, metrics } = await sampleMetrics(() =>
      runAutocannon(connections),
    );
    const row = {
      connections,
      qps: Math.round(result.requests.average),
      latencyP50: result.latency.p50,
      latencyP99: result.latency.p99,
      latencyAvg: result.latency.average.toFixed(2),
      cpuPercent: metrics ? metrics.cpu.percent : 'n/a',
      heapUsedMB: metrics
        ? (metrics.memory.heapUsed / 1024 / 1024).toFixed(1)
        : 'n/a',
    };
    rows.push(row);
    console.log(`done (${row.qps} req/s)`);
  }

  server.kill();
  // give the OS a moment to release the port before the next run
  await sleep(1500);

  return rows;
}

function printTable(baselineRows, alsRows) {
  const header = [
    'Concur.',
    'QPS(base)',
    'QPS(als)',
    'QPS diff',
    'p50(b)',
    'p50(a)',
    'p99(b)',
    'p99(a)',
    'avg(b)',
    'avg(a)',
    'CPU%(b)',
    'CPU%(a)',
    'Heap(b)MB',
    'Heap(a)MB',
  ];

  const rows = baselineRows.map((b, i) => {
    const a = alsRows[i];
    const qpsDiff = (((a.qps - b.qps) / b.qps) * 100).toFixed(1);
    return [
      b.connections,
      b.qps,
      a.qps,
      `${qpsDiff}%`,
      b.latencyP50,
      a.latencyP50,
      b.latencyP99,
      a.latencyP99,
      b.latencyAvg,
      a.latencyAvg,
      b.cpuPercent,
      a.cpuPercent,
      b.heapUsedMB,
      a.heapUsedMB,
    ].map(String);
  });

  // compute column widths
  const cols = header.map((h, i) => {
    const maxData = Math.max(...rows.map((r) => r[i].length));
    return Math.max(h.length, maxData);
  });

  const divider = cols.map((w) => '-'.repeat(w)).join('-+-');
  const fmt = (row) => row.map((v, i) => v.padStart(cols[i])).join(' | ');

  console.log('\n' + '='.repeat(divider.length));
  console.log('  RESULTS: AsyncLocalStorage Overhead Benchmark');
  console.log('  Latency in ms  |  QPS diff = (ALS - baseline) / baseline');
  console.log('='.repeat(divider.length));
  console.log(fmt(header));
  console.log(divider);
  rows.forEach((r) => console.log(fmt(r)));
  console.log('='.repeat(divider.length));
  console.log('\n(b) = baseline (no ALS)    (a) = ALS enabled\n');
}

(async () => {
  try {
    const baselineRows = await bench(false);
    const alsRows = await bench(true);
    printTable(baselineRows, alsRows);
  } catch (err) {
    console.error('Benchmark failed:', err);
    process.exit(1);
  }
})();
