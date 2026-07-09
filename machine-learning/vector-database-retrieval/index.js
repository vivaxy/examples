// Simplest vector database retrieval, with visualizations.
// Zero-dependency, runs fully in the browser.
// Pipeline: text -> vector (bag-of-words) -> store -> cosine similarity -> top-k.

// --- Embedding helpers -------------------------------------------------

// Split text into lowercase tokens (letters/digits only).
function tokenize(text) {
  return text.toLowerCase().match(/[a-z0-9]+/g) || [];
}

// Collect the vocabulary across all documents. The order of this array
// defines the dimensions of every embedding vector.
function buildVocabulary(docs) {
  const vocab = new Set();
  for (const text of docs) {
    for (const token of tokenize(text)) {
      vocab.add(token);
    }
  }
  return [...vocab];
}

// Bag-of-words embedding: each dimension is how many times a vocab term
// appears in the text. Same function for documents and queries, so they
// live in the same vector space.
function embed(text, vocab) {
  const counts = new Map();
  for (const token of tokenize(text)) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }
  return vocab.map((term) => counts.get(term) || 0);
}

// L2 norm of a vector.
function norm(v) {
  let s = 0;
  for (const x of v) s += x * x;
  return Math.sqrt(s);
}

// --- In-memory vector store -------------------------------------------

class VectorStore {
  constructor(docs) {
    this.vocab = buildVocabulary(docs);
    this.entries = docs.map((text) => ({
      text,
      vector: embed(text, this.vocab),
    }));
  }

  // Score every document against the query, exposing the intermediate
  // cosine-similarity values so the search process can be visualized.
  scoreBreakdown(queryText) {
    const queryVector = embed(queryText, this.vocab);
    const queryTokens = new Set(tokenize(queryText));
    const normQ = norm(queryVector);
    const rows = this.entries.map((entry, index) => {
      let dot = 0;
      for (let i = 0; i < queryVector.length; i++)
        dot += queryVector[i] * entry.vector[i];
      const normD = norm(entry.vector);
      const denom = normQ * normD;
      return {
        index,
        text: entry.text,
        vector: entry.vector,
        dot,
        normQ,
        normD,
        score: denom === 0 ? 0 : dot / denom,
      };
    });
    return { queryVector, queryTokens, normQ, rows };
  }
}

// --- Corpus ------------------------------------------------------------

const corpus = [
  'Cats love to eat fish and sleep in the sun.',
  'Dogs are loyal companions that enjoy running outdoors.',
  'Python is a popular programming language for data science.',
  'JavaScript runs in every modern web browser.',
  'Sushi is a Japanese dish made of vinegared rice and fish.',
  'A football match has two teams of eleven players each.',
  'Tomatoes and cheese are key ingredients of a pizza.',
  'Recursion is when a function calls itself to solve subproblems.',
];

const store = new VectorStore(corpus);

// --- DOM refs ----------------------------------------------------------

const input = document.getElementById('query');
const searchBtn = document.getElementById('search');
const corpusEl = document.getElementById('corpus');
const matrixCanvas = document.getElementById('matrix');
const queryVecCanvas = document.getElementById('query-vec');
const stepsEl = document.getElementById('steps');

// --- Corpus rendering --------------------------------------------------

// Render the corpus as cards, wrapping tokens that match the query in <mark>.
function renderCorpus(queryTokens) {
  corpusEl.innerHTML = corpus
    .map((text, i) => {
      // Split keeping delimiters so punctuation is preserved.
      const parts = text.split(/([A-Za-z0-9]+)/);
      const html = parts
        .map((part) => {
          if (!part) return '';
          if (!/[A-Za-z0-9]/.test(part)) return escapeHtml(part);
          const escaped = escapeHtml(part);
          return queryTokens.has(part.toLowerCase())
            ? `<mark>${escaped}</mark>`
            : escaped;
        })
        .join('');
      return `<div class="corpus-card"><span class="idx">${i}</span>${html}</div>`;
    })
    .join('');
}

// --- VectorStore matrix (docs x vocab heatmap) -------------------------

const CELL = 18; // px per cell
const LEFT_GUTTER = 28; // room for row labels 0..7
const TOP_GUTTER = 78; // room for rotated term labels

// Render the full docs x vocab matrix. highlightCols highlights the query's
// nonzero dimensions; currentRow outlines the document being scored.
function renderMatrix(highlightCols, currentRow) {
  const cols = store.vocab.length;
  const rows = store.entries.length;
  const cssW = LEFT_GUTTER + cols * CELL;
  const cssH = TOP_GUTTER + rows * CELL;
  const ctx = setupCanvas(matrixCanvas, cssW, cssH);

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  // Column highlight bands (drawn under cells).
  for (const c of highlightCols) {
    ctx.fillStyle = 'rgba(37, 99, 235, 0.08)';
    ctx.fillRect(LEFT_GUTTER + c * CELL, 0, CELL, cssH);
  }

  // Cells.
  for (let r = 0; r < rows; r++) {
    const vector = store.entries[r].vector;
    for (let c = 0; c < cols; c++) {
      const count = vector[c];
      if (count === 0) continue;
      const alpha = 0.25 + (0.6 * Math.min(count, 2)) / 2;
      ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
      ctx.fillRect(LEFT_GUTTER + c * CELL, TOP_GUTTER + r * CELL, CELL, CELL);
    }
  }

  // Grid lines.
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  for (let c = 0; c <= cols; c++) {
    const x = LEFT_GUTTER + c * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, TOP_GUTTER);
    ctx.lineTo(x, cssH);
    ctx.stroke();
  }
  for (let r = 0; r <= rows; r++) {
    const y = TOP_GUTTER + r * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(LEFT_GUTTER, y);
    ctx.lineTo(cssW, y);
    ctx.stroke();
  }

  // Row labels.
  ctx.fillStyle = '#666';
  ctx.textAlign = 'right';
  for (let r = 0; r < rows; r++) {
    ctx.fillText(String(r), LEFT_GUTTER - 6, TOP_GUTTER + r * CELL + CELL / 2);
  }

  // Column labels (rotated -60deg, anchored at the column's bottom).
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let c = 0; c < cols; c++) {
    const x = LEFT_GUTTER + c * CELL + CELL / 2;
    const y = TOP_GUTTER - 4;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 3);
    ctx.fillText(store.vocab[c], 0, 0);
    ctx.restore();
  }

  // Highlighted column outlines.
  ctx.strokeStyle = 'rgba(37, 99, 235, 0.6)';
  ctx.lineWidth = 1.5;
  for (const c of highlightCols) {
    const x = LEFT_GUTTER + c * CELL + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, cssH);
    ctx.stroke();
  }

  // Current row outline.
  if (currentRow !== null && currentRow !== undefined) {
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    const y = TOP_GUTTER + currentRow * CELL + 0.5;
    ctx.strokeRect(LEFT_GUTTER + 0.5, y, cols * CELL, CELL);
  }
}

// --- Query vector (compact heatmap of in-vocab query terms) -----------

// Render only the query's nonzero terms as a small heatmap. If the query has
// no in-vocab terms, show a placeholder.
function renderQueryVector(queryText) {
  const queryVector = embed(queryText, store.vocab);
  const terms = [];
  for (let i = 0; i < queryVector.length; i++) {
    if (queryVector[i] !== 0)
      terms.push({ term: store.vocab[i], count: queryVector[i] });
  }

  const ctx = queryVecCanvas.getContext('2d');

  if (terms.length === 0) {
    const cssW = 200;
    const cssH = 28;
    setupCanvas(queryVecCanvas, cssW, cssH);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.fillStyle = '#999';
    ctx.font = '12px system-ui, sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText('no in-vocab terms', 8, cssH / 2);
    return;
  }

  const cell = 18;
  const LEFT_GUTTER = 28; // matches renderMatrix LEFT_GUTTER
  const TOP_GUTTER = 78; // matches renderMatrix TOP_GUTTER (room for -60° labels)
  const cssW = LEFT_GUTTER + terms.length * cell;
  const cssH = TOP_GUTTER + cell;
  setupCanvas(queryVecCanvas, cssW, cssH);
  ctx.clearRect(0, 0, cssW, cssH);
  ctx.font = '11px system-ui, sans-serif';
  ctx.textBaseline = 'middle';

  // Cells.
  terms.forEach(({ count }, i) => {
    const x = LEFT_GUTTER + i * cell;
    const alpha = 0.25 + (0.6 * Math.min(count, 2)) / 2;
    ctx.fillStyle = `rgba(37, 99, 235, ${alpha})`;
    ctx.fillRect(x, TOP_GUTTER, cell, cell);
  });

  // Grid lines (continuous, like renderMatrix).
  ctx.strokeStyle = '#eee';
  ctx.lineWidth = 1;
  for (let c = 0; c <= terms.length; c++) {
    const x = LEFT_GUTTER + c * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, TOP_GUTTER);
    ctx.lineTo(x, cssH);
    ctx.stroke();
  }
  for (let r = 0; r <= 1; r++) {
    const y = TOP_GUTTER + r * cell + 0.5;
    ctx.beginPath();
    ctx.moveTo(LEFT_GUTTER, y);
    ctx.lineTo(cssW, y);
    ctx.stroke();
  }

  // Term labels (rotated -60deg, anchored like renderMatrix column labels) and
  // the count inside each cell.
  ctx.textAlign = 'right';
  terms.forEach(({ term, count }, i) => {
    const x = LEFT_GUTTER + i * cell;
    ctx.save();
    ctx.translate(x + cell / 2, TOP_GUTTER - 4);
    ctx.rotate(-Math.PI / 3);
    ctx.fillStyle = '#666';
    ctx.fillText(term, 0, 0);
    ctx.restore();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.fillText(String(count), x + cell / 2, TOP_GUTTER + cell / 2);
    ctx.textAlign = 'right';
  });
}

// --- Canvas sizing helper (devicePixelRatio aware) --------------------

// Size the canvas backing store for crispness and return a context that draws
// in CSS pixels.
function setupCanvas(canvas, cssW, cssH) {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

// --- Search process animation -----------------------------------------

let animating = false;
let runId = 0;

function highlightColsFrom(queryVector) {
  const cols = [];
  for (let i = 0; i < queryVector.length; i++) {
    if (queryVector[i] !== 0) cols.push(i);
  }
  return cols;
}

function animateSearch(queryText) {
  if (animating) return;
  animating = true;
  runId++;
  const myRun = runId;
  searchBtn.disabled = true;

  const r = store.scoreBreakdown(queryText);
  const highlightCols = highlightColsFrom(r.queryVector);

  renderCorpus(r.queryTokens);
  renderMatrix(highlightCols, null);
  renderQueryVector(queryText);

  // Build the 8 step rows (in corpus order; re-sorted after scoring).
  stepsEl.innerHTML = '';
  const stepEls = r.rows.map((row) => {
    const el = document.createElement('div');
    el.className = 'step';
    el.innerHTML =
      `<div class="row">` +
      `<span class="idx">${row.index}</span>` +
      `<div class="bar-track"><div class="bar-fill"></div></div>` +
      `<span class="score">0.000</span>` +
      `</div>` +
      `<div class="vals"></div>`;
    stepsEl.appendChild(el);
    return el;
  });

  const STEP_MS = 350;
  let i = 0;

  function step() {
    if (myRun !== runId) return; // superseded by a newer search
    if (i >= r.rows.length) {
      finish();
      return;
    }
    const prev = stepEls[i - 1];
    if (prev) prev.classList.remove('current');
    const row = r.rows[i];
    const el = stepEls[i];
    el.classList.add('current');
    el.classList.toggle('zero', row.score === 0);
    el.querySelector('.vals').textContent = `dot=${
      row.dot
    } · ‖q‖=${r.normQ.toFixed(2)} · ‖d‖=${row.normD.toFixed(2)}`;
    el.querySelector('.bar-fill').style.width = `${(row.score * 100).toFixed(
      1,
    )}%`;
    el.querySelector('.score').textContent = row.score.toFixed(3);
    renderMatrix(highlightCols, row.index);
    i++;
    setTimeout(step, STEP_MS);
  }

  function finish() {
    if (myRun !== runId) return;
    stepEls.forEach((el) => el.classList.remove('current'));
    renderMatrix(highlightCols, null);
    // Re-sort step rows by score, descending (appendChild moves existing nodes).
    [...r.rows]
      .sort((a, b) => b.score - a.score)
      .forEach((row) => stepsEl.appendChild(stepEls[row.index]));
    animating = false;
    searchBtn.disabled = false;
  }

  setTimeout(step, STEP_MS);
}

// --- Utilities ---------------------------------------------------------

function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      }[c]),
  );
}

// --- Wiring ------------------------------------------------------------

searchBtn.addEventListener('click', () => animateSearch(input.value.trim()));
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') animateSearch(input.value.trim());
});

renderCorpus(new Set());
renderMatrix([], null);
renderQueryVector('');
animateSearch('fish');
