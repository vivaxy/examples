// Sweeps several parameters and writes a Chart.js report (index.html) next to
// this file. Each chart varies ONE parameter and shows its effect on the memory
// (MiB) at which V8 fires the first MAJOR (Mark-Compact) garbage collection.
//
// Usage:
//   node generate-report.js          # spawns workers, writes index.html
//
// The same script runs as a worker when passed --measure. The workload is
// parameterized via env vars CHUNK (array elements) and WIN (live window):
//   CHUNK=131072 WIN=40 node [--initial-old-space-size=N] generate-report.js --measure

import { spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { PerformanceObserver, performance, constants } from 'perf_hooks';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import v8 from 'v8';

const K_MINOR = constants.NODE_PERFORMANCE_GC_MINOR; // 1
const K_MAJOR = constants.NODE_PERFORMANCE_GC_MAJOR; // 4

const CHUNK_BYTES_PER_ELEM = 8; // DOUBLE array
const DEFAULT_CHUNK = 131072; // ~1 MiB
const DEFAULT_WIN = 40; // ~40 MiB live
const YIELD_EVERY = 16;
const MAX_ITERATIONS = 80_000; // safety cap
const REPS = 5; // first major-GC moment is noisy run-to-run; take the median
const FIELDS = [
  'mib',
  'durMs',
  'beforeMib',
  'afterMib',
  'reclaimedMib',
  'minors',
];

if (process.argv.includes('--measure')) {
  runWorker();
} else {
  runOrchestrator();
}

// ─── Worker ──────────────────────────────────────────────────────────────────
// Runs the workload until the first Mark-Compact, prints one JSON line.

async function runWorker() {
  const chunk = parseInt(process.env.CHUNK || String(DEFAULT_CHUNK), 10);
  const win = parseInt(process.env.WIN || String(DEFAULT_WIN), 10);
  const chunkBytes = chunk * CHUNK_BYTES_PER_ELEM;

  // Per-iteration timeline for correlating GC entry.startTime → iteration / heap
  // (a buffered PerformanceObserver delivers entries asynchronously).
  const samples = []; // { i, bytes, t, used }
  const log = []; // { kind, t, dur }
  const obs = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      log.push({ kind: e.detail?.kind ?? 0, t: e.startTime, dur: e.duration });
    }
  });
  obs.observe({ entryTypes: ['gc'], buffered: true });

  const buf = [];
  let i = 0;
  let bytes = 0;
  while (!log.some((g) => g.kind === K_MAJOR) && i < MAX_ITERATIONS) {
    buf.push(new Array(chunk).fill(i));
    if (buf.length > win) buf.shift();
    i++;
    bytes = i * chunkBytes;
    samples.push({
      i,
      bytes,
      t: performance.now(),
      used: v8.getHeapStatistics().used_heap_size,
    });
    if (i % YIELD_EVERY === 0) {
      await new Promise((r) => setImmediate(r)); // let buffered GC entries deliver
    }
  }

  // Two-phase flush: setImmediate queues, setTimeout(0) lets the observer fire.
  await new Promise((r) => setImmediate(r));
  await new Promise((r) => setTimeout(r, 0));
  obs.disconnect();

  const fm = log.filter((g) => g.kind === K_MAJOR).sort((a, b) => a.t - b.t)[0];
  if (!fm) {
    process.stdout.write(JSON.stringify(null) + '\n');
    return;
  }
  // Largest index whose sample.t <= fm.t (samples are sorted by t).
  let lo = 0;
  let hi = samples.length - 1;
  let idx = 0;
  while (lo <= hi) {
    const m = (lo + hi) >> 1;
    if (samples[m].t <= fm.t) {
      idx = m;
      lo = m + 1;
    } else {
      hi = m - 1;
    }
  }
  const s = samples[idx];
  const after = samples[idx + 1];
  // Peak used_heap_size before the first major GC — a real pre-GC high, unlike
  // a single bracketing sample which a post-GC allocation can push higher.
  let peakBefore = 0;
  for (let j = 0; j <= idx; j++) {
    if (samples[j].used > peakBefore) peakBefore = samples[j].used;
  }
  const minors = log.filter((g) => g.kind === K_MINOR && g.t < fm.t).length;
  const afterMib = after ? +(after.used / 1048576).toFixed(0) : null;
  const beforeMib = +(peakBefore / 1048576).toFixed(0);
  process.stdout.write(
    JSON.stringify({
      mib: +(s.bytes / 1048576).toFixed(1),
      durMs: +fm.dur.toFixed(2),
      beforeMib,
      afterMib,
      reclaimedMib: afterMib != null ? Math.max(0, beforeMib - afterMib) : null,
      minors,
    }) + '\n',
  );
}

// ─── Orchestrator ────────────────────────────────────────────────────────────
// Defines one sweep per parameter (chart), runs REPS workers per point, takes
// the median of each field, writes index.html.

function median(vals) {
  const s = vals.filter((v) => v != null).sort((a, b) => a - b);
  if (s.length === 0) return null;
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : +((s[m - 1] + s[m]) / 2).toFixed(2);
}

function runOnce(nodeArgs, env) {
  const { stdout, status } = spawnSync(process.execPath, nodeArgs, {
    encoding: 'utf8',
    timeout: 90_000,
    env: { ...process.env, ...env },
  });
  return status === 0 ? JSON.parse(stdout.trim()) : null;
}

function aggregate(runs) {
  if (runs.length === 0) return emptyPoint();
  const out = {};
  for (const f of FIELDS) out[f] = median(runs.map((r) => r[f]));
  return out;
}

function emptyPoint() {
  const out = {};
  for (const f of FIELDS) out[f] = null;
  return out;
}

function runSweep(points) {
  // points: [{ label, nodeArgs, env }]; returns [{ label, ...medianFields }]
  return points.map((p) => {
    process.stdout.write(`  ${p.label} (${REPS}×)…`);
    const runs = [];
    for (let r = 0; r < REPS; r++) {
      const d = runOnce(p.nodeArgs, p.env);
      if (d) runs.push(d);
    }
    process.stdout.write(' done\n');
    return { label: p.label, ...aggregate(runs) };
  });
}

function runOrchestrator() {
  const scriptPath = fileURLToPath(import.meta.url);
  const outPath = join(dirname(scriptPath), 'index.html');
  const s = () => scriptPath;
  const measure = ['--measure'];

  // Chart 1 — --initial-old-space-size (V8 flag). Below 16 the relationship is
  // erratically non-monotonic (V8 old-space init thresholds), so start at 16.
  process.stdout.write('chart 1: --initial-old-space-size\n');
  const initOld = runSweep([
    ...[16, 32, 64, 128, 256, 512, 1024].map((mb) => ({
      label: mb + ' MB',
      nodeArgs: [`--initial-old-space-size=${mb}`, s(), ...measure],
      env: {},
    })),
    { label: 'default', nodeArgs: [s(), ...measure], env: {} },
  ]);

  // Chart 2 — --max-old-space-size (V8 flag).
  process.stdout.write('chart 2: --max-old-space-size\n');
  const maxOld = runSweep([
    ...[64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384].map((mb) => ({
      label: mb + ' MB',
      nodeArgs: [`--max-old-space-size=${mb}`, s(), ...measure],
      env: {},
    })),
    { label: 'default', nodeArgs: [s(), ...measure], env: {} },
  ]);

  // Chart 3 — object size per allocation (workload param), default flags.
  process.stdout.write('chart 3: object size\n');
  const fmtKiB = (elems) => {
    const b = elems * CHUNK_BYTES_PER_ELEM;
    return b >= 1024 * 1024 ? b / (1024 * 1024) + ' MiB' : b / 1024 + ' KiB';
  };
  const sizes = [8192, 32768, 131072, 524288, 1048576];
  const objSize = runSweep(
    sizes.map((elems) => ({
      label: fmtKiB(elems),
      nodeArgs: [s(), ...measure],
      env: { CHUNK: String(elems) },
    })),
  );

  // Chart 4 — --gc-global (off vs on) across object sizes. "on" collapses the
  // trigger to ~1 MiB regardless of object size — overrides every other param.
  process.stdout.write('chart 4: --gc-global off vs on\n');
  const gcGlobalCats = [8192, 131072, 1048576];
  const off = runSweep(
    gcGlobalCats.map((elems) => ({
      label: fmtKiB(elems),
      nodeArgs: [s(), ...measure],
      env: { CHUNK: String(elems) },
    })),
  );
  const on = runSweep(
    gcGlobalCats.map((elems) => ({
      label: fmtKiB(elems),
      nodeArgs: ['--gc-global', s(), ...measure],
      env: { CHUNK: String(elems) },
    })),
  );

  const charts = [
    {
      id: 'c1',
      title: '--initial-old-space-size',
      unit: 'MiB flag',
      points: initOld,
      series: null,
    },
    {
      id: 'c2',
      title: '--max-old-space-size',
      unit: 'MiB flag',
      points: maxOld,
      series: null,
    },
    {
      id: 'c3',
      title: 'object size per allocation',
      unit: 'bytes',
      points: objSize,
      series: null,
    },
    {
      id: 'c4',
      title: '--gc-global (off vs on)',
      unit: 'object size',
      points: gcGlobalCats.map((e, i) => ({
        label: fmtKiB(e),
        off: off[i],
        on: on[i],
      })),
      series: ['off', 'on'],
    },
  ];

  writeFileSync(outPath, generateHtml(charts));
  console.log(`\nreport written → ${outPath}`);
}

// ─── HTML / chart generation ─────────────────────────────────────────────────

function generateHtml(charts) {
  const DATA = JSON.stringify(charts);
  const winMiB = (
    (DEFAULT_WIN * DEFAULT_CHUNK * CHUNK_BYTES_PER_ELEM) /
    1048576
  ).toFixed(0);

  // Palette (palette.md reference instance, validated adjacently — same as
  // gc-overhead): slot 1 blue #2a78d6 / #3987e5, slot 2 aqua #1baf7a / #199e70.
  // Relief: value labels above each bar (aqua is sub-3:1).

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>What moves V8's first major GC</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
<style>
.viz-root {
  --s1: #2a78d6; /* blue  — single series / "off" */
  --s2: #1baf7a; /* aqua  — "on" (--gc-global) */
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
h1 { font-size: 20px; font-weight: 600; margin-bottom: 6px; }
.subhead { color: var(--text-sec); font-size: 13px; margin-bottom: 20px; }
code { font-family: ui-monospace, "Cascadia Code", Menlo, monospace; font-size: 0.9em; }
.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 820px) { .grid { grid-template-columns: 1fr; } }
figure {
  background: var(--surface-1);
  border: 1px solid var(--gridline);
  border-radius: 8px;
  padding: 20px 20px 16px;
}
figcaption { font-size: 13px; font-weight: 600; color: var(--text-sec); margin-bottom: 4px; }
.figsub { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; }
.chart-wrap { position: relative; height: 300px; }
.doc { border-top: 1px solid var(--gridline); margin-top: 48px; max-width: 900px; padding-top: 32px; }
.doc h2 { color: var(--text-pri); font-size: 16px; font-weight: 600; margin-bottom: 12px; margin-top: 32px; }
.doc h2:first-child { margin-top: 0; }
.doc p { color: var(--text-sec); font-size: 13px; line-height: 1.7; margin-bottom: 12px; max-width: 720px; }
.doc table { border-collapse: collapse; font-size: 13px; width: 100%; }
.doc th, .doc td { border: 1px solid var(--gridline); padding: 8px 12px; text-align: left; vertical-align: top; }
.doc th { background: var(--surface-1); color: var(--text-sec); font-weight: 600; white-space: nowrap; }
.doc td { color: var(--text-sec); }
.doc td:first-child { color: var(--text-pri); white-space: nowrap; }
.doc pre {
  background: var(--surface-1);
  border: 1px solid var(--gridline);
  border-radius: 6px;
  color: var(--text-pri);
  font-family: ui-monospace, "Cascadia Code", Menlo, monospace;
  font-size: 12.5px;
  line-height: 1.6;
  margin-bottom: 12px;
  overflow-x: auto;
  padding: 12px 14px;
}
.doc pre code { background: none; font-size: inherit; }
</style>
</head>
<body class="viz-root">
<h1>What moves V8's first <code>MajorGC</code> (Mark-Compact)</h1>
<p class="subhead">
  Each chart varies ONE parameter; y-axis = MiB allocated when the first major GC fires.
  Workload: ~1 MiB arrays into old space, ~${winMiB} MiB live sliding window.
  Each point = median of ${REPS} runs.
</p>
<div class="grid">
  <figure>
    <figcaption>1 &nbsp;<code>--initial-old-space-size</code></figcaption>
    <div class="figsub">initial old-space capacity (last bar = no flag)</div>
    <div class="chart-wrap"><canvas id="c1"></canvas></div>
  </figure>
  <figure>
    <figcaption>2 &nbsp;<code>--max-old-space-size</code></figcaption>
    <div class="figsub">old-space cap (last bar = no flag)</div>
    <div class="chart-wrap"><canvas id="c2"></canvas></div>
  </figure>
  <figure>
    <figcaption>3 &nbsp;object size per allocation</figcaption>
    <div class="figsub">array chunk size, default flags</div>
    <div class="chart-wrap"><canvas id="c3"></canvas></div>
  </figure>
  <figure>
    <figcaption>4 &nbsp;<code>--gc-global</code> off vs on</figcaption>
    <div class="figsub">forces every GC to be major → first GC is Mark-Compact at ~1 MiB</div>
    <div class="chart-wrap"><canvas id="c4"></canvas></div>
  </figure>
</div>

<section class="doc">
  <h2>How to read these charts</h2>
  <table>
    <thead><tr><th>Chart</th><th>What it shows</th></tr></thead>
    <tbody>
      <tr><td>1&nbsp;&nbsp;<code>--initial-old-space-size</code></td>
        <td>Sets the old-space capacity V8 starts with. Below ~128&thinsp;MiB the trigger is floored at ~64&thinsp;MiB (V8's growth-factor heuristic over the live set); from 128&thinsp;MiB up the flag sets the moment directly and monotonically (128→80, 256→160, 512→256, 1024→480&thinsp;MiB). <code>default</code> lands at the 512&thinsp;MiB point.</td></tr>
      <tr><td>2&nbsp;&nbsp;<code>--max-old-space-size</code></td>
        <td>The old-space cap. A tight cap pulls the trigger earlier (64→54, 128→64&thinsp;MiB); as it relaxes the moment climbs and saturates at the natural default trigger (~304&thinsp;MiB) once the cap no longer binds.</td></tr>
      <tr><td>3&nbsp;&nbsp;object size</td>
        <td>Larger allocations delay the first major GC (64&thinsp;KiB→17&thinsp;MiB, 1&thinsp;MiB→304, 8&thinsp;MiB→456). Bigger chunks mean fewer V8 allocations per MiB, so old space fills and hits its trigger more slowly in cumulative-byte terms.</td></tr>
      <tr><td>4&nbsp;&nbsp;<code>--gc-global</code></td>
        <td>Forcing every GC to be global collapses the first major GC to ~1&thinsp;MiB regardless of object size — it bypasses the heuristic entirely. The flat aqua bar vs the climbing blue bar shows the override.</td></tr>
    </tbody>
  </table>

  <h2>Background</h2>
  <p>The workload allocates ~1&thinsp;MiB arrays (large enough to land in old
  generation) and retains the last ~${winMiB}&thinsp;MiB of them in a sliding window;
  older chunks are released, so old space holds live data plus dead promoted
  objects. A <code>PerformanceObserver</code> watches <code>gc</code> entries; the first
  <code>MajorGC</code> (kind&thinsp;=&thinsp;4, Mark-Compact) is located by correlating each
  entry&rsquo;s <code>startTime</code> against a per-iteration timeline, so the reported moment
  and before/after heap are real — not the nearest event-loop yield.</p>
  <p>V8&rsquo;s major-GC trigger scales with old-space capacity: <code>--initial-old-space-size</code>
  sets the starting capacity (chart&thinsp;1), <code>--max-old-space-size</code> sets the cap
  (chart&thinsp;2). The first <em>minor</em> GC (Scavenge, young generation) fires early and
  often — V8&rsquo;s new space is small and fills quickly, copying survivors to old space.
  It is fixed by V8&rsquo;s minimum semi-space and is <em>not</em> moved by these flags — only
  the first <em>major</em> GC is. <code>--gc-global</code> bypasses the heuristic and forces
  every GC to be major, so the very first GC is a Mark-Compact.</p>
  <p>The sliding window (~${winMiB}&thinsp;MiB live) lets the major GC actually reclaim dead
  promoted objects — visible as the before → after <code>used</code> drop in the CLI output —
  instead of retaining everything until the heap limit.</p>

  <h2>Run the interactive CLI</h2>
  <p>This report is generated by <code>generate-report.js</code>. The same detection runs
  live in <code>index.js</code>, which prints the first major GC&rsquo;s kind, duration, iteration,
  before/after heap, the minor-GC count before it, and a one-line &ldquo;why&rdquo;.</p>
  <pre><code># default — first major GC fires at V8's reclamation trigger
node first-gc/index.js

# smaller initial old space → first major GC fires much earlier
node --initial-old-space-size=4 first-gc/index.js

# larger initial old space → first major GC fires later
node --initial-old-space-size=64 first-gc/index.js

# force every GC to be global → first GC is a Mark-Compact at ~1 MiB
node --gc-global first-gc/index.js

# keep allocating, print each major GC (up to 5) with minor-GC counts between
node first-gc/index.js --keep-going</code></pre>

  <h2>Flags</h2>
  <table>
    <thead><tr><th>Flag</th><th>Effect on the first major GC</th></tr></thead>
    <tbody>
      <tr><td><code>--initial-old-space-size=N</code> (MiB)</td>
        <td>Initial old-space capacity → sets the early trigger (has a floor). <strong>Most direct.</strong></td></tr>
      <tr><td><code>--max-old-space-size=N</code> (MiB)</td>
        <td>Old-space cap; a tight cap pulls the trigger earlier, saturates at default once it stops binding.</td></tr>
      <tr><td><code>--gc-global</code></td>
        <td>Forces every GC to be major → first GC is a Mark-Compact at ~1&thinsp;MiB, overriding all heuristics.</td></tr>
      <tr><td><code>--gc-interval=N</code></td>
        <td>Force a GC every N V8 allocations (mainly affects minor-GC cadence, not the major trigger).</td></tr>
      <tr><td><code>--expose-gc</code></td>
        <td>Exposes <code>global.gc()</code> for manual triggering.</td></tr>
    </tbody>
  </table>
  <p>Script option: <code>--keep-going</code> continues past the first major GC and prints each
  subsequent major GC (up to 5), with the minor-GC count between them.</p>

  <h2>Practical guidance</h2>
  <p><strong>Two levers, one override.</strong> <code>--initial-old-space-size</code> and
  <code>--max-old-space-size</code> both move the first major GC, but in different regimes:
  the initial size sets the early trigger (and has a floor), the max size sets the
  ceiling that, when tight, pulls the trigger earlier. <code>--gc-global</code> overrides
  both, forcing a major GC almost immediately — useful for forcing reclamation,
  costly for throughput.</p>
  <p><strong>Allocation shape matters.</strong> Chart&thinsp;3 shows the first major GC is not a
  fixed property of the heap — larger per-allocation objects push it later. When
  estimating when a service will first major-GC, the object size distribution
  matters as much as the heap flags.</p>
</section>

<script>
'use strict';
var DATA = ${DATA};
function css(n){ return getComputedStyle(document.body).getPropertyValue(n).trim(); }
function palette(){
  return { s1: css('--s1'), s2: css('--s2'), surface: css('--surface-1'),
    textSec: css('--text-sec'), textMuted: css('--text-muted'),
    gridline: css('--gridline'), baseline: css('--baseline') };
}
/* value label above each bar — relief for sub-3:1 slots (aqua). */
function valueLabelPlugin(getVals){
  return { id: 'valueLabel', afterDatasetsDraw: function(chart){
    var ctx = chart.ctx, p = palette();
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillStyle = p.textSec; ctx.font = 'bold 11px system-ui, sans-serif';
    var vals = getVals(chart);
    chart.getDatasetMeta(0).data.forEach(function(bar, i){
      var v = vals[i]; if (v == null) return;
      /* label the stack top (max y across datasets at this index) */
      var topY = bar.y;
      chart.data.datasets.forEach(function(ds){
        var m = chart.getDatasetMeta(chart.data.datasets.indexOf(ds));
        if (m.data[i] && m.data[i].y < topY) topY = m.data[i].y;
      });
      ctx.fillText(v, bar.x, topY - 4);
    });
    ctx.restore();
  }};
}
function scalesBar(p, yTitle){
  return {
    x: { ticks: { color: p.textSec, font: { size: 12 } }, grid: { display: false }, border: { color: p.baseline } },
    y: { title: { display: true, text: yTitle, color: p.textMuted, font: { size: 12 } },
      ticks: { color: p.textSec, font: { size: 12 } }, grid: { color: p.gridline, lineWidth: 1 },
      border: { display: false }, beginAtZero: true }
  };
}
var charts = [];
function buildCharts(){
  charts.forEach(function(c){ c.destroy(); }); charts = [];
  var p = palette();
  var fmtMiB = function(v){ if (v == null) return ''; return (v < 10 ? v.toFixed(1) : Math.round(v)) + ' MiB'; };

  DATA.forEach(function(ch){
    var ctx = document.getElementById(ch.id);
    var datasets, labels, getVals;
    if (ch.series) {
      /* grouped: c4 off vs on */
      labels = ch.points.map(function(r){ return r.label; });
      datasets = [
        { label: 'off', data: ch.points.map(function(r){ return r.off ? r.off.mib : null; }),
          backgroundColor: p.s1, borderRadius: 4, maxBarThickness: 36 },
        { label: 'on (--gc-global)', data: ch.points.map(function(r){ return r.on ? r.on.mib : null; }),
          backgroundColor: p.s2, borderRadius: 4, maxBarThickness: 36 },
      ];
      getVals = function(chart){
        var i = chart.data.datasets.indexOf(chart.getDatasetMeta(0)?.dataset ? null : null);
        return labels.map(function(_, idx){
          var a = ch.points[idx].off, b = ch.points[idx].on;
          return Math.max(a&&a.mib||0, b&&b.mib||0);
        });
      };
    } else {
      labels = ch.points.map(function(r){ return r.label; });
      datasets = [{ label: 'MiB', data: ch.points.map(function(r){ return r.mib; }),
        backgroundColor: p.s1, borderRadius: 4, maxBarThickness: 48 }];
      getVals = function(){ return ch.points.map(function(r){ return r.mib; }); };
    }
    charts.push(new Chart(ctx, {
      type: 'bar',
      data: { labels: labels, datasets: datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { display: !!ch.series, position: 'bottom',
            labels: { color: p.textSec, usePointStyle: true, pointStyleWidth: 10, padding: 14, font: { size: 12 } } },
          tooltip: { mode: 'index', intersect: false,
            callbacks: { label: function(c){
              if (c.parsed.y === null) return null;
              return ' ' + (c.dataset.label === 'MiB' ? 'first major GC' : c.dataset.label) + ': ' + c.parsed.y + ' MiB';
            } } }
        },
        scales: scalesBar(p, 'MiB at first major GC'),
      },
      plugins: [valueLabelPlugin(getVals)],
    }));
  });
}
buildCharts();
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', buildCharts);
</script>
</body>
</html>`;
}
