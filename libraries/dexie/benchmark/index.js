/**
 * @since 2022-03-14
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';
import { run } from '//cdn.skypack.dev/@vivaxy/framework/utils/benchmark.js';

async function open() {
  function fn(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    ctx.db = db;
  }

  function afterEach(ctx) {
    ctx.db.close();
  }

  console.log('open', await run(fn, { afterEach }));
}

async function read() {
  async function beforeAll(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    await db.friends.put({
      name: 'vivaxy',
      age: 20,
    });
    ctx.db = db;
  }

  async function fn(ctx) {
    await ctx.db.friends.toArray();
  }

  async function afterAll(ctx) {
    await ctx.db.friends.clear();
    ctx.db.close();
  }

  console.log('read', await run(fn, { beforeAll, afterAll }));
}

async function readInTransaction() {
  async function beforeAll(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    await db.friends.put({
      name: 'vivaxy',
      age: 20,
    });
    ctx.db = db;
  }

  async function fn(ctx) {
    await ctx.db.transaction('rw', ctx.db.friends, async () => {
      await ctx.db.friends.toArray();
    });
  }

  async function afterAll(ctx) {
    await ctx.db.friends.clear();
    ctx.db.close();
  }

  console.log('read in transaction', await run(fn, { beforeAll, afterAll }));
}

async function write() {
  function beforeAll(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    ctx.db = db;
  }

  async function fn(ctx) {
    await ctx.db.friends.put({ name: 'vivaxy', age: 20 });
  }

  async function afterAll(ctx) {
    await ctx.db.friends.clear();
    ctx.db.close();
  }

  console.log('write', await run(fn, { beforeAll, afterAll }));
}

async function writeInTransaction() {
  function beforeAll(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    ctx.db = db;
  }

  async function fn(ctx) {
    await ctx.db.transaction('rw', ctx.db.friends, async () => {
      await ctx.db.friends.put({ name: 'vivaxy', age: 20 });
    });
  }

  async function afterAll(ctx) {
    await ctx.db.friends.clear();
    ctx.db.close();
  }

  console.log('write in transaction', await run(fn, { beforeAll, afterAll }));
}

(async () => {
  await open();
  await read();
  await readInTransaction();
  await write();
  await writeInTransaction();
})();
