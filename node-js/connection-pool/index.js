import { ConnectionPool } from './connection-pool.js';

const CREATE_DELAY = 400; // 建立连接耗时（ms）
const QUERY_MIN = 1200; // 查询耗时下限（ms）
const QUERY_MAX = 2200; // 查询耗时上限（ms）

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 一个模拟连接：建立有耗时，query 有耗时。
class MockConnection {
  constructor(id) {
    this.id = id;
  }
  async query(task) {
    await sleep(task.duration);
    return { conn: this.id, task: task.id };
  }
}

// ---- demo 状态 ----
let generation = 0; // 重置计数，避免旧任务污染 UI
let pool = null;
let connections = []; // [{ id, conn, task }] 按 id 顺序
let tasks = []; // task 对象
let nextConnId = 0;
let nextTaskId = 0;
let usedConns = new Set(); // 已被使用过至少一次的连接 id（用于区分新建/复用）
let maxSizeInput, poolEl, queueEl, logEl, statsEl;

function log(text) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  const line = document.createElement('div');
  line.className = 'log-line';
  line.textContent = `${time}  ${text}`;
  logEl.prepend(line);
  // 限制日志条数
  while (logEl.children.length > 50) logEl.lastChild.remove();
}

function createPool(maxSize) {
  if (pool) pool.drain();
  connections = [];
  tasks = [];
  nextConnId = 0;
  nextTaskId = 0;
  usedConns = new Set();
  generation++;

  pool = new ConnectionPool({
    maxSize,
    create: async () => {
      const id = ++nextConnId;
      log(`创建连接 #${id}`);
      const conn = new MockConnection(id);
      connections.push({ id, conn, task: null, creating: true });
      render();
      await sleep(CREATE_DELAY);
      const rec = connections.find((c) => c.conn === conn);
      if (rec) rec.creating = false;
      render();
      return conn;
    },
    destroy: (conn) => {
      log(`销毁连接 #${conn.id}`);
    },
    onChange: () => render(),
  });
  log(`初始化连接池（maxSize=${maxSize}）`);
  render();
}

function submitTask() {
  const gen = generation;
  const task = {
    id: ++nextTaskId,
    state: 'queued', // queued | running | done | error
    conn: null,
    duration: QUERY_MIN + Math.random() * (QUERY_MAX - QUERY_MIN),
    startedAt: 0,
    queuedAt: performance.now(),
  };
  tasks.push(task);
  log(`任务 #${task.id} 提交，等待连接`);
  render();

  pool
    .withConnection(async (conn) => {
      if (gen !== generation) return; // 已被重置丢弃
      task.state = 'running';
      task.conn = conn;
      task.startedAt = performance.now();
      const rec = connections.find((c) => c.conn === conn);
      if (rec) rec.task = task;
      const isNew = !usedConns.has(conn.id);
      usedConns.add(conn.id);
      log(`任务 #${task.id} ${isNew ? '获得新' : '复用'}连接 #${conn.id}`);
      render();
      await conn.query(task);
    })
    .then(() => {
      if (gen !== generation) return;
      task.state = 'done';
      task.conn = null;
      const rec = connections.find((c) => c.task === task);
      if (rec) rec.task = null;
      log(`任务 #${task.id} 完成`);
      render();
    })
    .catch((err) => {
      if (gen !== generation) return;
      task.state = 'error';
      task.conn = null;
      log(`任务 #${task.id} 异常：${err.message}`);
      render();
    });
}

function render() {
  // 连接池槽位
  poolEl.innerHTML = '';
  const maxSize = pool ? pool.stats.maxSize : 0;
  // 已创建的连接 + 尚未创建的空槽位（占位到 maxSize）
  for (let i = 0; i < maxSize; i++) {
    const rec = connections[i];
    const slot = document.createElement('div');
    slot.className = 'slot';
    if (!rec) {
      slot.classList.add('empty');
      slot.textContent = '—';
    } else if (rec.creating) {
      slot.classList.add('creating');
      slot.innerHTML = `<span class="slot-id">#${rec.id}</span><span class="slot-state">创建中…</span>`;
    } else if (rec.task) {
      const t = rec.task;
      const elapsed = performance.now() - t.startedAt;
      const pct = Math.min(100, (elapsed / t.duration) * 100);
      slot.classList.add('busy');
      slot.innerHTML = `
        <span class="slot-id">#${rec.id}</span>
        <span class="slot-state">任务 #${t.id}</span>
        <span class="bar"><span class="bar-fill" style="width:${pct}%"></span></span>`;
    } else {
      slot.classList.add('idle');
      slot.innerHTML = `<span class="slot-id">#${rec.id}</span><span class="slot-state">空闲</span>`;
    }
    poolEl.appendChild(slot);
  }

  // 等待队列
  queueEl.innerHTML = '';
  const queued = tasks.filter((t) => t.state === 'queued');
  if (queued.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-hint';
    empty.textContent = '队列为空';
    queueEl.appendChild(empty);
  }
  for (const t of queued) {
    const waited = Math.round(performance.now() - t.queuedAt);
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.textContent = `任务 #${t.id}（等待 ${waited}ms）`;
    queueEl.appendChild(item);
  }

  // 统计
  if (pool) {
    const s = pool.stats;
    statsEl.textContent = `连接：${s.busy} 忙 / ${s.idle} 空闲 / ${s.total} 共（上限 ${s.maxSize}）｜ 等待：${s.waiters} ｜ 任务：${tasks.length}`;
  }
}

function buildUI(root) {
  root.innerHTML = `
    <h1>连接池（Connection Pool）</h1>
    <p class="subhead">
      通用连接池模式演示：懒创建、复用、排队等待。提交并发任务，观察连接按需创建（不超过上限）、
      超出部分排队、释放后复用给队首任务。
    </p>
    <div class="controls"></div>
    <div class="stats"></div>
    <h2>连接池</h2>
    <div class="pool"></div>
    <h2>等待队列</h2>
    <div class="queue"></div>
    <h2>事件日志</h2>
    <div class="log"></div>
  `;

  const controls = root.querySelector('.controls');
  controls.innerHTML = `
    <label>maxSize <input type="number" class="max-size" value="3" min="1" max="12" /></label>
    <button class="submit-one">提交 1 个任务</button>
    <button class="submit-ten">提交 10 个任务</button>
    <button class="reset">应用并重置</button>
  `;
  maxSizeInput = controls.querySelector('.max-size');
  controls.querySelector('.submit-one').addEventListener('click', submitTask);
  controls.querySelector('.submit-ten').addEventListener('click', () => {
    for (let i = 0; i < 10; i++) submitTask();
  });
  controls.querySelector('.reset').addEventListener('click', () => {
    createPool(Math.max(1, Number(maxSizeInput.value) || 1));
  });

  statsEl = root.querySelector('.stats');
  poolEl = root.querySelector('.pool');
  queueEl = root.querySelector('.queue');
  logEl = root.querySelector('.log');
}

const app = document.getElementById('app');
buildUI(app);
createPool(Number(maxSizeInput.value) || 3);

// 平滑更新进度条与等待计时
setInterval(() => {
  if (
    pool &&
    (pool.stats.busy > 0 || tasks.some((t) => t.state === 'queued'))
  ) {
    render();
  }
}, 60);
