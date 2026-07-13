/**
 * 通用连接池（Connection Pool）。
 *
 * 通过工厂函数注入「如何创建连接」，与具体连接类型解耦。
 * 核心模式：
 * - 懒创建：按需创建连接，最多不超过 maxSize
 * - 复用：释放的连接回到空闲队列，供下次 acquire 使用
 * - 排队等待：连接全部占用时，acquire 进入 FIFO 等待队列；
 *   有连接释放时直接转交给队首等待者（不经过空闲队列）
 * - withConnection：acquire → 执行 → release，异常也保证释放
 */
export class ConnectionPool {
  #factory;
  #maxSize;
  #idle = [];
  #busy = new Set();
  #waiters = []; // [{ resolve, reject }]
  #reserved = 0; // 已认领但尚未创建完成的连接数（避免并发 acquire 突破 maxSize）
  #onChange;
  #closed = false;

  constructor({ create, maxSize = 5, onChange = () => {} }) {
    this.#factory = create;
    this.#maxSize = maxSize;
    this.#onChange = onChange;
  }

  get stats() {
    return {
      idle: this.#idle.length,
      busy: this.#busy.size,
      waiters: this.#waiters.length,
      total: this.#idle.length + this.#busy.size,
      maxSize: this.#maxSize,
    };
  }

  async acquire() {
    if (this.#closed) throw new Error('连接池已关闭');

    // 1. 有空闲连接，直接取用
    if (this.#idle.length > 0) {
      const conn = this.#idle.pop();
      this.#busy.add(conn);
      this.#onChange('acquire:idle', conn);
      return conn;
    }

    // 2. 未达上限，创建新连接。先认领名额再 await，避免并发 acquire 突破 maxSize。
    if (this.#busy.size + this.#idle.length + this.#reserved < this.#maxSize) {
      this.#reserved++;
      let conn;
      try {
        conn = await this.#factory();
      } finally {
        this.#reserved--;
      }
      if (this.#closed) {
        this.#factory.destroy?.(conn);
        throw new Error('连接池已关闭');
      }
      this.#busy.add(conn);
      this.#onChange('acquire:create', conn);
      return conn;
    }

    // 3. 全部占用，排队等待，直到有连接被释放并转交
    return new Promise((resolve, reject) => {
      this.#waiters.push({ resolve, reject });
      this.#onChange('acquire:wait', null);
    });
  }

  release(conn) {
    if (!this.#busy.has(conn)) return;
    this.#busy.delete(conn);

    const waiter = this.#waiters.shift();
    if (waiter) {
      // 直接转交给等待者，连接保持忙碌
      this.#busy.add(conn);
      this.#onChange('release:handoff', conn);
      waiter.resolve(conn);
    } else {
      // 没有等待者，回到空闲队列
      this.#idle.push(conn);
      this.#onChange('release:idle', conn);
    }
  }

  async withConnection(fn) {
    const conn = await this.acquire();
    try {
      return await fn(conn);
    } finally {
      this.release(conn);
    }
  }

  // 关闭池：销毁空闲连接、拒绝等待者。进行中的连接释放时变为 no-op。
  drain() {
    if (this.#closed) return;
    this.#closed = true;

    const idle = this.#idle.splice(0);
    for (const conn of idle) this.#factory.destroy?.(conn);

    const waiters = this.#waiters.splice(0);
    for (const waiter of waiters) waiter.reject(new Error('连接池已关闭'));

    this.#onChange('drain', null);
  }
}
