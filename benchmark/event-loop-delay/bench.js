/**
 * @since 2026-04-13
 * @author vivaxy
 *
 * Event Loop Delay monitor overhead benchmark.
 *
 * Starts the Koa server in baseline and monitor modes, then runs autocannon at
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
 * @param {boolean} monitorEnabled
 * @returns {{ proc: ChildProcess, kill: () => void }}
 */
function startServer(monitorEnabled) {
  const args = ['server.js'];
  if (monitorEnabled) args.push('--monitor');
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

async function bench(monitorEnabled) {
  const label = monitorEnabled ? 'Monitor' : 'Baseline';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  Running: ${label} mode`);
  console.log('='.repeat(60));

  const server = startServer(monitorEnabled);
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

function printTable(baselineRows, monitorRows) {
  const header = [
    'Concur.',
    'QPS(base)',
    'QPS(mon)',
    'QPS diff',
    'p50(b)',
    'p50(m)',
    'p99(b)',
    'p99(m)',
    'avg(b)',
    'avg(m)',
    'CPU%(b)',
    'CPU%(m)',
    'Heap(b)MB',
    'Heap(m)MB',
  ];

  const rows = baselineRows.map((b, i) => {
    const m = monitorRows[i];
    const qpsDiff = (((m.qps - b.qps) / b.qps) * 100).toFixed(1);
    return [
      b.connections,
      b.qps,
      m.qps,
      `${qpsDiff}%`,
      b.latencyP50,
      m.latencyP50,
      b.latencyP99,
      m.latencyP99,
      b.latencyAvg,
      m.latencyAvg,
      b.cpuPercent,
      m.cpuPercent,
      b.heapUsedMB,
      m.heapUsedMB,
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
  console.log('  RESULTS: Event Loop Delay Monitor Overhead Benchmark');
  console.log('  Latency in ms  |  QPS diff = (monitor - baseline) / baseline');
  console.log('='.repeat(divider.length));
  console.log(fmt(header));
  console.log(divider);
  rows.forEach((r) => console.log(fmt(r)));
  console.log('='.repeat(divider.length));
  console.log(
    '\n(b) = baseline (no monitor)    (m) = monitorEventLoopDelay enabled\n',
  );
}

(async () => {
  try {
    const baselineRows = await bench(false);
    const monitorRows = await bench(true);
    printTable(baselineRows, monitorRows);
  } catch (err) {
    console.error('Benchmark failed:', err);
    process.exit(1);
  }
})();
