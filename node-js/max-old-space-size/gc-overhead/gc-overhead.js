// Measures GC overhead across a range of --max-old-space-size values and
// writes four Chart.js charts to index.html next to this file.
//
// Usage:
//   node gc-overhead.js          # spawns workers, writes index.html
//
// The same script runs as a worker when passed --json:
//   node --max-old-space-size=N gc-overhead.js --json <N>

import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { PerformanceObserver, performance, constants } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import v8 from 'v8';

// Heap-size flag values (MB) to sweep; each spawns a fresh child process so
// the V8 limit applies cleanly without cross-contamination.
const HEAP_SIZES = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];

const ITERATIONS = 5000;
// 25 K elements × ~4 bytes (pointer compression) ≈ 100 KB per cache entry
const ELEMENTS_PER_ENTRY = 25 * 1024;
// 200 × 100 KB ≈ 20 MB working set kept alive throughout the run
const CACHE_SIZE = 200;

// V8 GC kind constants used as dataset keys.
// Modern V8 routes all Major GC through the incremental marking pipeline, so
// the stop-the-world MarkCompact phase is reported as kind=4 (MajorGC), not
// kind=2. kind=2 only appears when GC is forced without incremental marking.
const K_MINOR = constants.NODE_PERFORMANCE_GC_MINOR; // 1
const K_MAJOR = constants.NODE_PERFORMANCE_GC_MAJOR; // 4
const K_INCR = constants.NODE_PERFORMANCE_GC_INCREMENTAL; // 8

if (process.argv.includes('--json')) {
  runWorker();
} else {
  runOrchestrator();
}

// ─── Worker ──────────────────────────────────────────────────────────────────
// Runs the workload and prints a single JSON line to stdout.

async function runWorker() {
  const flagMb = parseInt(process.argv[process.argv.indexOf('--json') + 1], 10);
  const { heap_size_limit } = v8.getHeapStatistics();
  const limitMb = Math.round(heap_size_limit / 1024 / 1024);

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

  // Two-phase yield: setImmediate lets the observer queue its entries, then
  // setTimeout(0) lets the observer callback actually fire and deliver them.
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setTimeout(resolve, 0));
  obs.disconnect();

  process.stdout.write(
    JSON.stringify({ flagMb, limitMb, elapsed, counts, times }) + '\n',
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
// Spawns one worker per heap size, collects JSON results, writes index.html.

function runOrchestrator() {
  const scriptPath = fileURLToPath(import.meta.url);
  const outPath = join(dirname(scriptPath), 'index.html');
  const rawResults = [];

  for (const mb of HEAP_SIZES) {
    process.stdout.write(`measuring --max-old-space-size=${mb}…`);
    const { stdout, stderr, status } = spawnSync(
      process.execPath,
      [`--max-old-space-size=${mb}`, scriptPath, '--json', String(mb)],
      { encoding: 'utf8', timeout: 60_000 },
    );
    if (status !== 0) {
      process.stderr.write(`\nworker failed for ${mb} MB:\n${stderr}\n`);
      process.exit(1);
    }
    rawResults.push(JSON.parse(stdout.trim()));
    process.stdout.write(' done\n');
  }

  writeFileSync(outPath, generateHtml(rawResults));
  console.log(`\nchart written → ${outPath}`);
}

// ─── HTML / chart generation ──────────────────────────────────────────────────

function generateHtml(rawResults) {
  const r0 = ELEMENTS_PER_ENTRY * 4; // bytes per entry (pointer-compressed)
  const entryKb = Math.round(r0 / 1024);
  const workingSetMb = Math.round((CACHE_SIZE * r0) / 1024 / 1024);

  // Derive all chart series from raw worker output.
  const rows = rawResults.map((r) => {
    const minorMs = r.times[K_MINOR] ?? 0;
    const majorMs = r.times[K_MAJOR] ?? 0;
    const incrMs = r.times[K_INCR] ?? 0;
    const minorCount = r.counts[K_MINOR] ?? 0;
    const majorCount = r.counts[K_MAJOR] ?? 0;
    const incrCount = r.counts[K_INCR] ?? 0;
    const totalMs = minorMs + majorMs + incrMs;
    const totalCount = minorCount + majorCount + incrCount;

    const pct = (ms) =>
      r.elapsed > 0 ? +((ms / r.elapsed) * 100).toFixed(2) : 0;
    const avg = (ms, n) => (n > 0 ? +(ms / n).toFixed(2) : 0);

    return {
      flagMb: r.flagMb,
      limitMb: r.limitMb,
      // chart 1 — % of elapsed time
      minorPct: pct(minorMs),
      majorPct: pct(majorMs),
      incrPct: pct(incrMs),
      // chart 2 — total ms
      minorMs: +minorMs.toFixed(0),
      majorMs: +majorMs.toFixed(0),
      incrMs: +incrMs.toFixed(0),
      // chart 3 — event count
      minorCount,
      majorCount,
      incrCount,
      // chart 4 — avg ms/event
      minorAvg: avg(minorMs, minorCount),
      majorAvg: avg(majorMs, majorCount),
      incrAvg: avg(incrMs, incrCount),
      totalAvg: avg(totalMs, totalCount),
      // totals for bar-cap labels
      totalPct: pct(totalMs),
      totalMs: +totalMs.toFixed(0),
      totalCount,
    };
  });

  // Embed pre-computed data as JSON so the browser script is logic-free.
  const DATA = JSON.stringify({ rows });

  // Palette (from palette.md reference instance, validated adjacently):
  //   MinorGC → slot 1 blue  #2a78d6 / #3987e5
  //   MajorGC → slot 2 aqua  #1baf7a / #199e70
  //   IncrGC  → slot 3 yellow#eda100 / #c98500
  //   TotalAvg→ slot 4 green #008300 / #008300
  // Validation: node dataviz/scripts/validate_palette.js
  //   "#2a78d6,#1baf7a,#eda100,#008300" --mode light  → ALL CHECKS PASS
  // Relief applied: direct labels on bar caps (aqua & yellow are sub-3:1).

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>GC Overhead vs --max-old-space-size</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>
.viz-root {
  /* categorical slots — fixed order (CVD-validated, palette.md) */
  --s1: #2a78d6; /* MinorGC       blue   */
  --s2: #1baf7a; /* MajorGC       aqua   */
  --s3: #eda100; /* IncrementalGC yellow */
  --s4: #008300; /* Total avg     green  */
  /* chrome */
  --surface-1:  #fcfcfb;
  --page-plane: #f9f9f7;
  --text-pri:   #0b0b0b;
  --text-sec:   #52514e;
  --text-muted: #898781;
  --gridline:   #e1e0d9;
  --baseline:   #c3c2b7;
}
@media (prefers-color-scheme: dark) {
  .viz-root {
    --s1: #3987e5;
    --s2: #199e70;
    --s3: #c98500;
    --s4: #008300;
    --surface-1:  #1a1a19;
    --page-plane: #0d0d0d;
    --text-pri:   #ffffff;
    --text-sec:   #c3c2b7;
    --text-muted: #898781;
    --gridline:   #2c2c2a;
    --baseline:   #383835;
  }
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body.viz-root {
  background: var(--page-plane);
  color: var(--text-pri);
  font-family: system-ui, -apple-system, "Segoe UI", sans-serif;
  font-size: 14px;
  line-height: 1.5;
  padding: 28px 36px 56px;
}

h1 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}
.subhead {
  color: var(--text-sec);
  font-size: 13px;
  margin-bottom: 32px;
}
code {
  font-family: ui-monospace, "Cascadia Code", Menlo, monospace;
  font-size: 0.9em;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
@media (max-width: 760px) {
  .grid { grid-template-columns: 1fr; }
}

figure {
  background: var(--surface-1);
  border: 1px solid var(--gridline);
  border-radius: 8px;
  padding: 20px 20px 16px;
}
figcaption {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-sec);
  margin-bottom: 12px;
}
.chart-wrap {
  position: relative;
  height: 280px;
}
</style>
</head>
<body class="viz-root">
<h1>GC Overhead vs <code>--max-old-space-size</code></h1>
<p class="subhead">
  ${ITERATIONS.toLocaleString()} iterations &nbsp;·&nbsp;
  ${CACHE_SIZE} &times; ${entryKb}&nbsp;KB &asymp; ${workingSetMb}&nbsp;MB working set &nbsp;·&nbsp;
  x-axis: flag value (effective <code>heap_size_limit</code> in parentheses)
</p>
<div class="grid">
  <figure>
    <figcaption>1 &nbsp;GC share of elapsed time &nbsp;(%)</figcaption>
    <div class="chart-wrap"><canvas id="c1"></canvas></div>
  </figure>
  <figure>
    <figcaption>2 &nbsp;GC total time &nbsp;(ms)</figcaption>
    <div class="chart-wrap"><canvas id="c2"></canvas></div>
  </figure>
  <figure>
    <figcaption>3 &nbsp;GC event count</figcaption>
    <div class="chart-wrap"><canvas id="c3"></canvas></div>
  </figure>
  <figure>
    <figcaption>4 &nbsp;Avg time per event &nbsp;(ms / event)</figcaption>
    <div class="chart-wrap"><canvas id="c4"></canvas></div>
  </figure>
</div>

<script>
'use strict';
var DATA = ${DATA};
var rows = DATA.rows;

/* read a CSS custom property from the root element */
function css(name) {
  return getComputedStyle(document.body)
    .getPropertyValue(name).trim();
}

/* snapshot all palette roles from current CSS variables */
function palette() {
  return {
    s1: css('--s1'), s2: css('--s2'), s3: css('--s3'), s4: css('--s4'),
    surface:   css('--surface-1'),
    textSec:   css('--text-sec'),
    textMuted: css('--text-muted'),
    gridline:  css('--gridline'),
    baseline:  css('--baseline'),
  };
}

/* x-axis labels: two-line — flag value / effective limit */
var labels = rows.map(function(r) {
  return [r.flagMb + ' MB', '(' + r.limitMb + ' MB)'];
});

/* ── stacked-bar dataset helpers ──────────────────────────────────────────── */
/* The 2 px border in the surface color creates the surface gap between
   stacked segments per marks-and-anatomy.md. */
function dsStack(label, data, color, surface) {
  return {
    label: label, data: data,
    backgroundColor: color,
    borderColor: surface,
    borderWidth: { top: 2, right: 0, bottom: 0, left: 0 },
    borderRadius: 0,
    borderSkipped: 'bottom',
    maxBarThickness: 48,
  };
}
/* topmost segment in a stack gets the 4 px rounded data-end */
function dsStackTop(label, data, color, surface) {
  var d = dsStack(label, data, color, surface);
  d.borderRadius = { topLeft: 4, topRight: 4 };
  return d;
}

/* ── grouped-bar dataset helper ───────────────────────────────────────────── */
function dsGroup(label, data, color) {
  return {
    label: label, data: data,
    backgroundColor: color,
    borderRadius: 4,
    maxBarThickness: 24,
  };
}

/* ── bar-cap total-label plugin ───────────────────────────────────────────── */
/* Writes the total above the topmost stacked segment.
   Relief for sub-3:1 slots (aqua, yellow): direct labels are the mitigation. */
function makeTotalPlugin(fmtFn) {
  return {
    id: 'totalLabel',
    afterDatasetsDraw: function(chart) {
      var ctx = chart.ctx;
      var p = palette();
      var dsCount = chart.data.datasets.length;
      var lastMeta = chart.getDatasetMeta(dsCount - 1);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = p.textSec;
      ctx.font = 'bold 11px system-ui, sans-serif';
      lastMeta.data.forEach(function(bar, i) {
        var total = chart.data.datasets.reduce(function(s, ds) {
          return s + (Number(ds.data[i]) || 0);
        }, 0);
        ctx.fillText(fmtFn(total), bar.x, bar.y - 4);
      });
      ctx.restore();
    },
  };
}

/* ── shared axis / plugin options ─────────────────────────────────────────── */
function scalesStacked(p, yTitle) {
  return {
    x: {
      stacked: true,
      ticks: { color: p.textSec, font: { size: 12 } },
      grid: { display: false },
      border: { color: p.baseline },
    },
    y: {
      stacked: true,
      title: { display: true, text: yTitle, color: p.textMuted, font: { size: 12 } },
      ticks: { color: p.textSec, font: { size: 12 } },
      grid: { color: p.gridline, lineWidth: 1 },
      border: { display: false },
    },
  };
}

function scalesGrouped(p, yTitle) {
  return {
    x: {
      ticks: { color: p.textSec, font: { size: 12 } },
      grid: { display: false },
      border: { color: p.baseline },
    },
    y: {
      title: { display: true, text: yTitle, color: p.textMuted, font: { size: 12 } },
      ticks: { color: p.textSec, font: { size: 12 } },
      grid: { color: p.gridline, lineWidth: 1 },
      border: { display: false },
    },
  };
}

function legendOpts(p) {
  return {
    position: 'bottom',
    labels: {
      color: p.textSec,
      usePointStyle: true,
      pointStyleWidth: 10,
      padding: 14,
      font: { size: 12 },
    },
  };
}

/* ── build all four charts ────────────────────────────────────────────────── */
var charts = [];

function buildCharts() {
  charts.forEach(function(c) { c.destroy(); });
  charts = [];
  var p = palette();
  var surf = p.surface;

  /* chart 1 — GC share of elapsed time (%) */
  charts.push(new Chart(document.getElementById('c1'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        dsStack('MinorGC',        rows.map(function(r) { return r.minorPct; }), p.s1, surf),
        dsStack('MajorGC',        rows.map(function(r) { return r.majorPct; }), p.s2, surf),
        dsStackTop('IncrementalGC', rows.map(function(r) { return r.incrPct;  }), p.s3, surf),
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: legendOpts(p),
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + ' %';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) { return s + it.parsed.y; }, 0);
              return ['Total: ' + total.toFixed(1) + ' %'];
            },
          },
        },
      },
      scales: scalesStacked(p, '%'),
    },
    plugins: [makeTotalPlugin(function(v) { return v.toFixed(1) + ' %'; })],
  }));

  /* chart 2 — GC total time (ms) */
  charts.push(new Chart(document.getElementById('c2'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        dsStack('MinorGC',        rows.map(function(r) { return r.minorMs; }), p.s1, surf),
        dsStack('MajorGC',        rows.map(function(r) { return r.majorMs; }), p.s2, surf),
        dsStackTop('IncrementalGC', rows.map(function(r) { return r.incrMs;  }), p.s3, surf),
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: legendOpts(p),
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + ' ms';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) { return s + it.parsed.y; }, 0);
              return ['Total: ' + Math.round(total) + ' ms'];
            },
          },
        },
      },
      scales: scalesStacked(p, 'ms'),
    },
    plugins: [makeTotalPlugin(function(v) { return Math.round(v) + ' ms'; })],
  }));

  /* chart 3 — GC event count */
  charts.push(new Chart(document.getElementById('c3'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        dsStack('MinorGC',        rows.map(function(r) { return r.minorCount; }), p.s1, surf),
        dsStack('MajorGC',        rows.map(function(r) { return r.majorCount; }), p.s2, surf),
        dsStackTop('IncrementalGC', rows.map(function(r) { return r.incrCount;  }), p.s3, surf),
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: legendOpts(p),
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + ' events';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) { return s + it.parsed.y; }, 0);
              return ['Total: ' + total + ' events'];
            },
          },
        },
      },
      scales: scalesStacked(p, 'events'),
    },
    plugins: [makeTotalPlugin(function(v) { return Math.round(v); })],
  }));

  /* chart 4 — avg time per event (ms/event) — grouped bar */
  charts.push(new Chart(document.getElementById('c4'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        dsGroup('MinorGC',        rows.map(function(r) { return r.minorAvg; }), p.s1),
        dsGroup('MajorGC',        rows.map(function(r) { return r.majorAvg; }), p.s2),
        dsGroup('IncrementalGC',  rows.map(function(r) { return r.incrAvg;  }), p.s3),
        dsGroup('Total avg',      rows.map(function(r) { return r.totalAvg; }), p.s4),
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: {
        legend: legendOpts(p),
        tooltip: {
          mode: 'index', intersect: false,
          callbacks: {
            label: function(ctx) {
              return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(2) + ' ms';
            },
          },
        },
      },
      scales: scalesGrouped(p, 'ms / event'),
    },
  }));
}

buildCharts();

/* rebuild on OS color-scheme change so CSS vars re-resolve */
window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', buildCharts);
</script>
</body>
</html>`;
}
