// Measures GC overhead across a range of --max-old-space-size values and
// cache entry sizes, and writes four Chart.js charts to index.html next to
// this file.
//
// Usage:
//   node gc-overhead.js          # spawns workers, writes index.html
//
// The same script runs as a worker when passed --json:
//   node --max-old-space-size=N gc-overhead.js --json <N> <entrySize>

import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { PerformanceObserver, performance, constants } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import v8 from 'v8';

// Heap-size flag values (MB) to sweep; each spawns a fresh child process so
// the V8 limit applies cleanly without cross-contamination.
const HEAP_SIZES = [64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384];

// Cache entry sizes (array elements) to sweep; each × ~4 bytes = bytes per entry.
// Small heaps will OOM at large entry sizes — shown as gaps in charts.
const ENTRY_SIZES = [
  4 * 1024, //  16 KB / entry →   ~3 MB working set
  8 * 1024, //  32 KB / entry →   ~6 MB working set
  32 * 1024, // 128 KB / entry →  ~25 MB working set
  64 * 1024, // 256 KB / entry →  ~50 MB working set
  128 * 1024, // 512 KB / entry → ~100 MB working set
  256 * 1024, //   1 MB / entry → ~200 MB working set
  512 * 1024, //   2 MB / entry → ~400 MB working set
  1024 * 1024, //   4 MB / entry → ~800 MB working set
  2048 * 1024, //   8 MB / entry →  ~1.6 GB working set
  4096 * 1024, //  16 MB / entry →  ~3.1 GB working set
  8192 * 1024, //  32 MB / entry →  ~6.3 GB working set
  16384 * 1024, //  64 MB / entry → ~12.5 GB working set
];

const ITERATIONS = 5000;
// 200 cache slots; rotating writes release old entries to GC.
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
  const jsonIdx = process.argv.indexOf('--json');
  const flagMb = parseInt(process.argv[jsonIdx + 1], 10);
  const entrySize = parseInt(process.argv[jsonIdx + 2], 10);
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
    cache[i % CACHE_SIZE] = new Array(entrySize).fill(i);
  }
  const elapsed = performance.now() - start;

  // Two-phase yield: setImmediate lets the observer queue its entries, then
  // setTimeout(0) lets the observer callback actually fire and deliver them.
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setTimeout(resolve, 0));
  obs.disconnect();

  process.stdout.write(
    JSON.stringify({ flagMb, limitMb, entrySize, elapsed, counts, times }) +
      '\n',
  );
}

// ─── Orchestrator ─────────────────────────────────────────────────────────────
// Spawns one worker per (heap size × entry size) combo, collects JSON results,
// writes index.html.

function runOrchestrator() {
  const scriptPath = fileURLToPath(import.meta.url);
  const outPath = join(dirname(scriptPath), 'index.html');
  const resultsByEntrySize = {};

  for (const entrySize of ENTRY_SIZES) {
    resultsByEntrySize[entrySize] = [];
    for (const mb of HEAP_SIZES) {
      process.stdout.write(
        `measuring --max-old-space-size=${mb} entry-size=${entrySize}…`,
      );
      const { stdout, stderr, status } = spawnSync(
        process.execPath,
        [
          `--max-old-space-size=${mb}`,
          scriptPath,
          '--json',
          String(mb),
          String(entrySize),
        ],
        { encoding: 'utf8', timeout: 60_000 },
      );
      if (status !== 0) {
        process.stderr.write(
          `\n  worker failed (${mb} MB / entry ${entrySize}): skipping\n`,
        );
        resultsByEntrySize[entrySize].push(null);
      } else {
        resultsByEntrySize[entrySize].push(JSON.parse(stdout.trim()));
      }
      process.stdout.write(' done\n');
    }
  }

  // Collect limitMb for each flagMb from any successful worker result so the
  // x-axis labels can show both the flag value and the effective heap limit.
  const limitByFlagMb = {};
  for (const rawResults of Object.values(resultsByEntrySize)) {
    for (const r of rawResults) {
      if (r && !(r.flagMb in limitByFlagMb)) {
        limitByFlagMb[r.flagMb] = r.limitMb;
      }
    }
  }

  writeFileSync(outPath, generateHtml(resultsByEntrySize, limitByFlagMb));
  console.log(`\nchart written → ${outPath}`);
}

// ─── HTML / chart generation ──────────────────────────────────────────────────

function generateHtml(resultsByEntrySize, limitByFlagMb) {
  // Format a byte count as a human-readable string (KB / MB / GB).
  function fmtBytes(n) {
    if (n >= 1024 * 1024 * 1024)
      return +(n / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
    if (n >= 1024 * 1024) return Math.round(n / (1024 * 1024)) + ' MB';
    return Math.round(n / 1024) + ' KB';
  }

  // Per-entry-size metadata and derived chart rows.
  const entrySizes = ENTRY_SIZES.map((entrySize) => {
    const bytesPerEntry = entrySize * 4; // pointer-compressed
    const entryLabel = fmtBytes(bytesPerEntry);
    const workingSetLabel = fmtBytes(CACHE_SIZE * bytesPerEntry);
    const rows = (resultsByEntrySize[entrySize] ?? []).map((r) => {
      if (!r) return null;
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
    return { entryLabel, workingSetLabel, rows };
  });

  // x-axis labels: two-line — flag value / effective heap limit.
  const heapLabels = HEAP_SIZES.map((mb) => {
    const lim = limitByFlagMb[mb];
    return lim ? [mb + ' MB', '(' + lim + ' MB)'] : [mb + ' MB'];
  });

  // Tab buttons (server-rendered; first tab is active to match currentIdx=0).
  const tabsHtml = ENTRY_SIZES.map((entrySize, i) => {
    const bytesPerEntry = entrySize * 4;
    const entryLabel = fmtBytes(bytesPerEntry);
    const workingSetLabel = fmtBytes(CACHE_SIZE * bytesPerEntry);
    const cls = i === 0 ? ' active' : '';
    return `  <button class="tab${cls}" data-idx="${i}">${entryLabel} / entry &middot; ${workingSetLabel} working set</button>`;
  }).join('\n');

  // Embed pre-computed data as JSON so the browser script is logic-free.
  const DATA = JSON.stringify({ heapLabels, entrySizes });

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
  margin-bottom: 16px;
}
code {
  font-family: ui-monospace, "Cascadia Code", Menlo, monospace;
  font-size: 0.9em;
}

/* ── tab selector ─────────────────────────────────────────────────────────── */
.tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.tab {
  background: none;
  border: 1px solid var(--gridline);
  border-radius: 20px;
  color: var(--text-sec);
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  padding: 5px 14px;
  transition: border-color 0.1s, color 0.1s;
}
.tab:hover:not(.active) {
  border-color: var(--text-muted);
  color: var(--text-pri);
}
.tab.active {
  background: var(--s1);
  border-color: var(--s1);
  color: #fff;
}

/* ── chart grid ───────────────────────────────────────────────────────────── */
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

/* ── documentation section ────────────────────────────────────────────────── */
.doc {
  border-top: 1px solid var(--gridline);
  margin-top: 48px;
  max-width: 900px;
  padding-top: 32px;
}
.doc h2 {
  color: var(--text-pri);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 32px;
}
.doc h2:first-child { margin-top: 0; }
.doc p {
  color: var(--text-sec);
  font-size: 13px;
  line-height: 1.7;
  margin-bottom: 12px;
  max-width: 720px;
}
.doc table {
  border-collapse: collapse;
  font-size: 13px;
  width: 100%;
}
.doc th, .doc td {
  border: 1px solid var(--gridline);
  padding: 8px 12px;
  text-align: left;
  vertical-align: top;
}
.doc th {
  background: var(--surface-1);
  color: var(--text-sec);
  font-weight: 600;
  white-space: nowrap;
}
.doc td { color: var(--text-sec); }
.doc td:first-child { color: var(--text-pri); white-space: nowrap; }
</style>
</head>
<body class="viz-root">
<h1>GC Overhead vs <code>--max-old-space-size</code></h1>
<p class="subhead">
  ${ITERATIONS.toLocaleString()} iterations &nbsp;&middot;&nbsp;
  ${CACHE_SIZE} entries &thinsp;&times;&thinsp;<span id="entry-meta"></span>
  &nbsp;&middot;&nbsp;
  x-axis: flag value (effective <code>heap_size_limit</code> in parentheses)
</p>
<div class="tabs" id="tabs">
${tabsHtml}
</div>
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

<section class="doc">
  <h2>How to read these charts</h2>
  <table>
    <thead><tr><th>Chart</th><th>What to look for</th></tr></thead>
    <tbody>
      <tr>
        <td>1&nbsp;&nbsp;GC share (%)</td>
        <td>At 64&thinsp;MB with a ~20&thinsp;MB working set, MajorGC alone consumes ~55&thinsp;% of elapsed time. The fraction drops steeply through 512&thinsp;MB and plateaus near zero beyond 1&ndash;2&thinsp;GB, where MinorGC dominates and MajorGC barely fires. Switch to the smaller entry size to see this effect compress; switch to the larger to see even more aggressive GC pressure at small heaps.</td>
      </tr>
      <tr>
        <td>2&nbsp;&nbsp;GC total time (ms)</td>
        <td>MajorGC total collapses as the heap grows (high at 64&thinsp;MB, near zero at &ge;1&thinsp;GB). MinorGC total rises in the opposite direction: with a large heap the young generation fills up without MajorGC intervening, forcing more minor scavenges.</td>
      </tr>
      <tr>
        <td>3&nbsp;&nbsp;GC event count</td>
        <td>MajorGC fires dozens of times at 64&thinsp;MB and approaches zero at &ge;1&thinsp;GB; IncrementalGC at 128+&thinsp;MB tracks MajorGC 1:1. At 64&thinsp;MB many major GCs are triggered by allocation failure rather than the incremental scheduler, so IncrementalGC count is lower. MinorGC count increases steadily with heap size.</td>
      </tr>
      <tr>
        <td>4&nbsp;&nbsp;Avg time / event (ms/event)</td>
        <td>Counter-intuitively, each individual MajorGC event <em>takes longer</em> as the heap grows (a few ms at 64&thinsp;MB, tens of ms at multi-GB sizes). With a large heap V8 commits more address space and has more internal metadata to process per cycle. The net overhead is still lower because events are far less frequent.</td>
      </tr>
    </tbody>
  </table>

  <h2>Background</h2>
  <p>A ${CACHE_SIZE}-entry circular cache keeps the working set alive in old generation.
  With a small heap the working set occupies a large fraction of available space,
  so V8 runs Major GC (MarkCompact via incremental marking) aggressively. With a
  large heap the same working set is negligible &mdash; Major GC barely fires.</p>
  <p>Modern V8 routes all Major GC through the incremental marking pipeline, so the
  stop-the-world MarkCompact phase shows up as <code>MajorGC</code> (kind=4), not
  <code>ConstructRetained</code> (kind=2). Each MajorGC is paired with a corresponding
  <code>IncrementalGC</code> event (kind=8) for the preceding marking phase.</p>

  <h2>GC kinds</h2>
  <table>
    <thead><tr><th>Kind</th><th>Name</th><th>What it is</th></tr></thead>
    <tbody>
      <tr><td>1</td><td><code>MinorGC</code></td><td>Scavenger on the young generation (new space). Fast; promotes survivors to old generation.</td></tr>
      <tr><td>2</td><td><code>ConstructRetained</code></td><td>Stop-the-world MarkCompact <strong>without</strong> incremental marking. Rare in normal runs; appears when GC is forced (e.g.&nbsp;<code>global.gc()</code> with <code>--expose-gc</code>).</td></tr>
      <tr><td>4</td><td><code>MajorGC</code></td><td>Full old-generation collection (MarkCompact) <strong>with</strong> incremental marking. This is the dominant cost under heap pressure.</td></tr>
      <tr><td>8</td><td><code>IncrementalGC</code></td><td>One incremental marking step. V8 slices marking work across many small pauses between JS execution turns.</td></tr>
      <tr><td>16</td><td><code>WeakCB</code></td><td>Processing weak references and their finalizer callbacks after a GC cycle.</td></tr>
      <tr><td>32</td><td><code>AllExternalMemory</code></td><td>GC triggered to account for externally allocated memory (e.g. large <code>Buffer</code>&thinsp;/&thinsp;<code>ArrayBuffer</code> backing stores) that exceeded a threshold.</td></tr>
      <tr><td>64</td><td><code>ScheduleIdle</code></td><td>Idle-time GC &mdash; V8 schedules a collection when the event loop has spare time, to amortise future pressure.</td></tr>
    </tbody>
  </table>
</section>

<script>
'use strict';
var DATA = ${DATA};
var currentIdx = 0;

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

/* update the subhead span to show the currently selected entry size */
function updateSubhead() {
  var es = DATA.entrySizes[currentIdx];
  document.getElementById('entry-meta').innerHTML =
    es.entryLabel + '&thinsp;/&thinsp;entry &asymp;&thinsp;' + es.workingSetLabel + '&thinsp;working set';
}

/* tab click handler */
document.getElementById('tabs').addEventListener('click', function(e) {
  var btn = e.target.closest('[data-idx]');
  if (!btn) return;
  var btns = document.querySelectorAll('.tab');
  for (var i = 0; i < btns.length; i++) btns[i].classList.remove('active');
  btn.classList.add('active');
  currentIdx = +btn.dataset.idx;
  buildCharts();
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
  updateSubhead();
  charts.forEach(function(c) { c.destroy(); });
  charts = [];
  var p = palette();
  var surf = p.surface;
  var rows = DATA.entrySizes[currentIdx].rows;
  var labels = DATA.heapLabels;

  /* extract a named field from each row; null for failed/missing rows */
  function get(field) {
    return rows.map(function(r) { return r ? r[field] : null; });
  }

  /* chart 1 — GC share of elapsed time (%) */
  charts.push(new Chart(document.getElementById('c1'), {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        dsStack('MinorGC',          get('minorPct'), p.s1, surf),
        dsStack('MajorGC',          get('majorPct'), p.s2, surf),
        dsStackTop('IncrementalGC', get('incrPct'),  p.s3, surf),
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
              if (ctx.parsed.y === null) return null;
              return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y.toFixed(1) + ' %';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) {
                return s + (it.parsed.y || 0);
              }, 0);
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
        dsStack('MinorGC',          get('minorMs'), p.s1, surf),
        dsStack('MajorGC',          get('majorMs'), p.s2, surf),
        dsStackTop('IncrementalGC', get('incrMs'),  p.s3, surf),
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
              if (ctx.parsed.y === null) return null;
              return ' ' + ctx.dataset.label + ': ' + Math.round(ctx.parsed.y) + ' ms';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) {
                return s + (it.parsed.y || 0);
              }, 0);
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
        dsStack('MinorGC',          get('minorCount'), p.s1, surf),
        dsStack('MajorGC',          get('majorCount'), p.s2, surf),
        dsStackTop('IncrementalGC', get('incrCount'),  p.s3, surf),
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
              if (ctx.parsed.y === null) return null;
              return ' ' + ctx.dataset.label + ': ' + ctx.parsed.y + ' events';
            },
            afterBody: function(items) {
              var total = items.reduce(function(s, it) {
                return s + (it.parsed.y || 0);
              }, 0);
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
        dsGroup('MinorGC',       get('minorAvg'), p.s1),
        dsGroup('MajorGC',       get('majorAvg'), p.s2),
        dsGroup('IncrementalGC', get('incrAvg'),  p.s3),
        dsGroup('Total avg',     get('totalAvg'), p.s4),
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
              if (ctx.parsed.y === null) return null;
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
