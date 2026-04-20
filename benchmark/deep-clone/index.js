/**
 * @since 2026-04-16
 * @author vivaxy
 */

// ─── Deep Clone Implementations ──────────────────────────────────────────────

function cloneJSON(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function cloneStructured(obj) {
  return structuredClone(obj);
}

function cloneRecursive(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    const arr = new Array(obj.length);
    for (let i = 0; i < obj.length; i++) arr[i] = cloneRecursive(obj[i]);
    return arr;
  }
  const copy = {};
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++)
    copy[keys[i]] = cloneRecursive(obj[keys[i]]);
  return copy;
}

function cloneIterative(root) {
  if (root === null || typeof root !== 'object') return root;
  const copy = Array.isArray(root) ? new Array(root.length) : {};
  const stack = [{ src: root, dst: copy }];
  while (stack.length > 0) {
    const { src, dst } = stack.pop();
    const keys = Object.keys(src);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const val = src[key];
      if (val !== null && typeof val === 'object') {
        const childCopy = Array.isArray(val) ? new Array(val.length) : {};
        dst[key] = childCopy;
        stack.push({ src: val, dst: childCopy });
      } else {
        dst[key] = val;
      }
    }
  }
  return copy;
}

function cloneMessageChannel(obj) {
  return new Promise((resolve) => {
    const { port1, port2 } = new MessageChannel();
    port2.onmessage = (ev) => {
      resolve(ev.data);
      port1.close();
      port2.close();
    };
    port1.postMessage(obj);
  });
}

const METHODS = [
  { label: 'JSON (parse+stringify)', fn: cloneJSON, async: false },
  { label: 'structuredClone', fn: cloneStructured, async: false },
  { label: 'Recursive', fn: cloneRecursive, async: false },
  { label: 'Iterative', fn: cloneIterative, async: false },
  { label: 'MessageChannel', fn: cloneMessageChannel, async: true },
];

// ─── Object Schema DSL ────────────────────────────────────────────────────────
//
// Schema shape (JSON):
// {
//   "type": "object" | "array" | "string" | "number" | "boolean",
//
//   -- for "object" --
//   "keys": number,           // how many keys
//   "keyPrefix": "k",         // optional key name prefix
//   "value": <schema>,        // schema for each value (default: mixed primitives)
//
//   -- for "array" --
//   "length": number,
//   "item": <schema>,         // schema for each element
//
//   -- for "string" | "number" | "boolean" --
//   (no extra fields, generates random primitives)
// }
//
// Special shorthand: if a schema has a "depth" field, it wraps recursively:
// { "type": "object", "keys": 3, "depth": 4 }
//  → object with 3 keys, each value is again the same schema at depth-1
//
// ─────────────────────────────────────────────────────────────────────────────

let _nodeCounter = 0;

function buildFromSchema(schema, currentDepth) {
  if (!schema || typeof schema !== 'object') return null;

  const depth = currentDepth !== undefined ? currentDepth : schema.depth ?? 0;

  switch (schema.type) {
    case 'string':
      return `str-${_nodeCounter++}`;

    case 'number':
      return _nodeCounter++;

    case 'boolean':
      return _nodeCounter++ % 2 === 0;

    case 'object': {
      const keys = schema.keys ?? 3;
      const prefix = schema.keyPrefix ?? 'k';
      const obj = {};
      for (let i = 0; i < keys; i++) {
        const key = `${prefix}${i}`;
        if (depth > 0) {
          // recurse using same schema but one level deeper
          obj[key] = buildFromSchema(schema, depth - 1);
        } else if (schema.value) {
          obj[key] = buildFromSchema(schema.value);
        } else {
          // leaf: mixed primitives
          const r = _nodeCounter++ % 3;
          obj[key] =
            r === 0
              ? `val-${_nodeCounter}`
              : r === 1
              ? _nodeCounter
              : _nodeCounter % 2 === 0;
        }
      }
      return obj;
    }

    case 'array': {
      const length = schema.length ?? 10;
      const arr = new Array(length);
      for (let i = 0; i < length; i++) {
        if (depth > 0) {
          arr[i] = buildFromSchema(schema, depth - 1);
        } else if (schema.item) {
          arr[i] = buildFromSchema(schema.item);
        } else {
          arr[i] = `item-${_nodeCounter++}`;
        }
      }
      return arr;
    }

    default:
      return null;
  }
}

function buildObject(schema) {
  _nodeCounter = 0;
  return buildFromSchema(schema);
}

// ─── Built-in Scenario Templates ─────────────────────────────────────────────

const SCENARIOS = [
  {
    label: 'Flat object (100 keys)',
    iterations: 5000,
    schema: { type: 'object', keys: 100 },
  },
  {
    label: 'Flat object (1 000 keys)',
    iterations: 2000,
    schema: { type: 'object', keys: 1000 },
  },
  {
    label: 'Flat object (10 000 keys)',
    iterations: 500,
    schema: { type: 'object', keys: 10000 },
  },
  {
    label: 'Deep object (depth 10, breadth 3)',
    iterations: 5000,
    schema: { type: 'object', keys: 3, depth: 10 },
  },
  {
    label: 'Deep object (depth 50, breadth 3)',
    iterations: 2000,
    schema: { type: 'object', keys: 3, depth: 50 },
  },
  {
    label: 'Deep object (depth 100, breadth 3)',
    iterations: 1000,
    schema: { type: 'object', keys: 3, depth: 100 },
  },
  {
    label: 'Mixed object (width 5, depth 4)',
    iterations: 2000,
    schema: {
      type: 'object',
      keys: 5,
      depth: 0,
      value: { type: 'object', keys: 3, depth: 4 },
    },
  },
  {
    label: 'Mixed object (width 5, depth 6)',
    iterations: 500,
    schema: {
      type: 'object',
      keys: 5,
      depth: 0,
      value: { type: 'object', keys: 3, depth: 6 },
    },
  },
  {
    label: 'Array of objects (1 000 × 10 keys)',
    iterations: 1000,
    schema: {
      type: 'array',
      length: 1000,
      item: { type: 'object', keys: 10 },
    },
  },
  {
    label: 'Array of objects (10 000 × 5 keys)',
    iterations: 200,
    schema: {
      type: 'array',
      length: 10000,
      item: { type: 'object', keys: 5 },
    },
  },
];

// ─── Benchmark Runner ─────────────────────────────────────────────────────────

function runSync(fn, obj, iterations) {
  fn(obj);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) fn(obj);
  return performance.now() - start;
}

async function runAsync(fn, obj, iterations) {
  await fn(obj);
  const start = performance.now();
  for (let i = 0; i < iterations; i++) await fn(obj);
  return performance.now() - start;
}

// ─── UI Builder ───────────────────────────────────────────────────────────────

// --- Schema editor section ---
const editorSection = document.createElement('div');
editorSection.className = 'editor-section';

// Template picker
const pickerRow = document.createElement('div');
pickerRow.className = 'picker-row';

const pickerLabel = document.createElement('label');
pickerLabel.textContent = 'Load template: ';

const templateSelect = document.createElement('select');
const blankOpt = document.createElement('option');
blankOpt.value = '';
blankOpt.textContent = '— custom —';
templateSelect.appendChild(blankOpt);
SCENARIOS.forEach((s, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.textContent = s.label;
  templateSelect.appendChild(opt);
});
pickerLabel.appendChild(templateSelect);
pickerRow.appendChild(pickerLabel);
editorSection.appendChild(pickerRow);

// Iterations input
const iterRow = document.createElement('div');
iterRow.className = 'picker-row';
const iterLabel = document.createElement('label');
iterLabel.textContent = 'Iterations: ';
const iterInput = document.createElement('input');
iterInput.type = 'number';
iterInput.min = 1;
iterInput.value = 2000;
iterInput.className = 'iter-input';
iterLabel.appendChild(iterInput);
iterRow.appendChild(iterLabel);
editorSection.appendChild(iterRow);

// Test data editor
const dataLabel = document.createElement('div');
dataLabel.className = 'schema-label';
dataLabel.textContent = 'Test data (JSON):';
editorSection.appendChild(dataLabel);

const textarea = document.createElement('textarea');
textarea.className = 'schema-textarea';
textarea.rows = 8;
textarea.spellcheck = false;
editorSection.appendChild(textarea);

// Parse error display
const schemaError = document.createElement('div');
schemaError.className = 'schema-error';
editorSection.appendChild(schemaError);

// Action buttons row
const actionRow = document.createElement('div');
actionRow.className = 'action-row';

const runButton = document.createElement('button');
runButton.textContent = 'Start benchmark!';
runButton.className = 'run-btn';

actionRow.appendChild(runButton);
editorSection.appendChild(actionRow);

document.body.appendChild(editorSection);

// --- Results section ---
const resultsDiv = document.createElement('div');
resultsDiv.className = 'results';
document.body.appendChild(resultsDiv);

// ─── URL Hash State ───────────────────────────────────────────────────────────

/**
 * Gzip-compress a string and return a base64url-encoded string.
 */
async function gzipEncodeBase64url(str) {
  const encoder = new TextEncoder();
  const input = encoder.encode(str);
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(input);
  writer.close();
  const chunks = [];
  const reader = cs.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  // Convert to base64url
  let binary = '';
  for (let i = 0; i < merged.length; i++)
    binary += String.fromCharCode(merged[i]);
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Decode a base64url + Gzip-compressed string back to the original string.
 */
async function gzipDecodeBase64url(str) {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const b64 = pad ? padded + '='.repeat(4 - pad) : padded;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(bytes);
  writer.close();
  const chunks = [];
  const reader = ds.readable.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return new TextDecoder().decode(merged);
}

/**
 * Encode current data JSON + iterations into URL hash (no history entry).
 */
async function updateHash(dataJson, iterations) {
  const encoded = await gzipEncodeBase64url(dataJson);
  const hash = `data=${encoded}&iterations=${iterations}`;
  history.replaceState(null, '', `#${hash}`);
}

/**
 * Parse URL hash → { dataJson, iterations } or null.
 */
async function readHash() {
  const raw = location.hash.slice(1); // strip leading '#'
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const encodedData = params.get('data');
  // support legacy 'schema' param (plain base64url, no gzip) for back-compat
  const legacyEncoded = params.get('schema');
  const iterations = params.get('iterations');
  if (!encodedData && !legacyEncoded) return null;
  try {
    let dataJson;
    if (encodedData) {
      dataJson = await gzipDecodeBase64url(encodedData);
    } else {
      // legacy path: plain base64url decode
      const padded = legacyEncoded.replace(/-/g, '+').replace(/_/g, '/');
      const pad = padded.length % 4;
      const b64 = pad ? padded + '='.repeat(4 - pad) : padded;
      dataJson = decodeURIComponent(escape(atob(b64)));
    }
    JSON.parse(dataJson); // validate
    return { dataJson, iterations: iterations ? Number(iterations) : null };
  } catch {
    return null;
  }
}

// ─── State & Logic ────────────────────────────────────────────────────────────

/**
 * Build data from a scenario's schema, write it as pretty JSON into the textarea,
 * and optionally sync to the URL hash.
 */
async function setData(schema, iterations, { updateUrl = true } = {}) {
  const data = buildObject(schema);
  const json = JSON.stringify(data, null, 2);
  textarea.value = json;
  iterInput.value = iterations;
  schemaError.textContent = '';
  if (updateUrl) await updateHash(json, iterations);
}

function parseData() {
  schemaError.textContent = '';
  try {
    return JSON.parse(textarea.value);
  } catch (e) {
    schemaError.textContent = `JSON parse error: ${e.message}`;
    return null;
  }
}

// ── Initialise from URL hash or default template ──

async function init() {
  const fromHash = await readHash();
  if (fromHash) {
    textarea.value = fromHash.dataJson;
    iterInput.value = fromHash.iterations ?? SCENARIOS[0].iterations;
    schemaError.textContent = '';
    templateSelect.value = '';
  } else {
    await setData(SCENARIOS[0].schema, SCENARIOS[0].iterations, {
      updateUrl: true,
    });
    templateSelect.value = '0';
  }

  // Template selection → generate data, fill editor, update URL
  templateSelect.addEventListener('change', () => {
    const idx = templateSelect.value;
    if (idx === '') return;
    const s = SCENARIOS[Number(idx)];
    setData(s.schema, s.iterations, { updateUrl: true });
  });

  // Manual data edit → switch to custom + update URL
  textarea.addEventListener('input', () => {
    templateSelect.value = '';
    try {
      JSON.parse(textarea.value);
      updateHash(textarea.value, iterInput.value);
    } catch {
      // invalid JSON — leave hash unchanged
    }
  });

  // Iterations change → update URL
  iterInput.addEventListener('input', () => {
    try {
      JSON.parse(textarea.value);
      updateHash(textarea.value, iterInput.value);
    } catch {
      // ignore
    }
  });

  // Auto-run when page loads with a hash
  if (fromHash) {
    startBenchmark();
  }
}

init();

async function startBenchmark() {
  const obj = parseData();
  if (obj === null) return;

  const iterations = Math.max(1, Number(iterInput.value) || 1);

  runButton.disabled = true;
  runButton.textContent = 'Running…';
  resultsDiv.innerHTML = '';

  const templateIdx = templateSelect.value;
  const label =
    templateIdx !== '' ? SCENARIOS[Number(templateIdx)].label : 'Custom data';

  await runScenario({ label, iterations, obj });

  runButton.disabled = false;
  runButton.textContent = 'Start benchmark!';
}

runButton.addEventListener('click', startBenchmark);

async function runScenario({ label, iterations, obj }) {
  console.log(
    `\n=== ${label} (iterations: ${iterations.toLocaleString()}) ===`,
  );

  // ── Step 1: correctness check (one clone each, compare to baseline) ──
  let baseline = null; // JSON string of the first successful result
  let baselineLabel = null;
  const consistency = []; // { label, status: 'baseline'|'match'|'mismatch'|'error', detail }

  for (const method of METHODS) {
    let cloned;
    try {
      cloned = method.async ? await method.fn(obj) : method.fn(obj);
    } catch (e) {
      consistency.push({
        label: method.label,
        status: 'error',
        detail: e.message,
      });
      continue;
    }
    const serialised = JSON.stringify(cloned);
    if (baseline === null) {
      baseline = serialised;
      baselineLabel = method.label;
      consistency.push({
        label: method.label,
        status: 'baseline',
        detail: null,
      });
    } else {
      const match = serialised === baseline;
      consistency.push({
        label: method.label,
        status: match ? 'match' : 'mismatch',
        detail: match ? null : diffSummary(JSON.parse(baseline), cloned),
      });
      if (!match) {
        console.warn(
          `  [Consistency] ${method.label} differs from ${baselineLabel}`,
        );
      }
    }
  }

  // ── Step 2: performance ──
  const timings = [];

  for (const method of METHODS) {
    let ms;
    try {
      if (method.async) {
        ms = await runAsync(method.fn, obj, iterations);
      } else {
        ms = runSync(method.fn, obj, iterations);
      }
    } catch (err) {
      ms = null;
      console.log(`  ${method.label}: ERROR — ${err.message}`);
    }
    timings.push({ method: method.label, ms });
    if (ms !== null) {
      console.log(`  ${method.label}: ${ms.toFixed(2)}ms`);
    }
  }

  const validTimings = timings.filter((t) => t.ms !== null);
  const minMs = Math.min(...validTimings.map((t) => t.ms));

  // ── Render result table ──
  const h3 = document.createElement('h3');
  h3.textContent = `${label}  (${iterations.toLocaleString()} iterations)`;
  resultsDiv.appendChild(h3);

  const table = document.createElement('table');
  table.className = 'result-table';

  const thead = table.createTHead();
  const hRow = thead.insertRow();
  [
    'Method',
    'Total (ms)',
    'Per-op (µs)',
    'Relative',
    'Output consistent',
  ].forEach((text) => {
    const th = document.createElement('th');
    th.textContent = text;
    hRow.appendChild(th);
  });

  const tbody = table.createTBody();
  timings.forEach(({ method, ms }) => {
    const row = tbody.insertRow();
    const nameCell = row.insertCell();
    nameCell.textContent = method;

    if (ms === null) {
      const errCell = row.insertCell();
      errCell.colSpan = 3;
      errCell.textContent = 'Error / Not supported';
      errCell.className = 'error';
      // still show consistency
      const conCell = row.insertCell();
      const con = consistency.find((c) => c.label === method);
      if (con) renderConsistencyCell(conCell, con);
      return;
    }

    const isFastest = ms === minMs;

    const totalCell = row.insertCell();
    totalCell.textContent = ms.toFixed(2);
    if (isFastest) totalCell.className = 'fastest';

    const perOpCell = row.insertCell();
    perOpCell.textContent = ((ms / iterations) * 1000).toFixed(3);
    if (isFastest) perOpCell.className = 'fastest';

    const relCell = row.insertCell();
    relCell.textContent = `${(ms / minMs).toFixed(2)}×`;
    if (isFastest) relCell.className = 'fastest';

    const conCell = row.insertCell();
    const con = consistency.find((c) => c.label === method);
    if (con) renderConsistencyCell(conCell, con);
  });

  resultsDiv.appendChild(table);
}

function renderConsistencyCell(cell, con) {
  switch (con.status) {
    case 'baseline':
      cell.textContent = '✓ baseline';
      cell.className = 'con-baseline';
      break;
    case 'match':
      cell.textContent = '✓ match';
      cell.className = 'con-match';
      break;
    case 'mismatch':
      cell.textContent = '✗ mismatch';
      cell.className = 'con-mismatch';
      cell.title = con.detail ?? '';
      break;
    case 'error':
      cell.textContent = `✗ error`;
      cell.className = 'con-error';
      cell.title = con.detail ?? '';
      break;
  }
}

/**
 * Produce a short human-readable summary of the first difference found.
 */
function diffSummary(a, b, path = '') {
  if (a === b) return null;
  if (typeof a !== typeof b) {
    return `[${path || 'root'}] type ${typeof a} vs ${typeof b}`;
  }
  if (typeof a !== 'object' || a === null || b === null) {
    return `[${path || 'root'}] ${JSON.stringify(a)} vs ${JSON.stringify(b)}`;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return `[${path || 'root'}] ${keysA.length} keys vs ${keysB.length} keys`;
  }
  for (const k of keysA) {
    const sub = diffSummary(a[k], b[k], path ? `${path}.${k}` : k);
    if (sub) return sub;
  }
  return null;
}
