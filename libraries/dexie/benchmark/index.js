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

function getBeforeAll(dbSize) {
  return async function beforeAll(ctx) {
    const db = new Dexie('vivaxy');
    db.version(1).stores({
      friends: '++id, name, age',
    });
    await db.friends.bulkPut(
      Array.from({ length: dbSize }, (i) => {
        return {
          name: 'vivaxy',
          age: i,
        };
      }),
    );
    ctx.db = db;
  };
}

async function afterAll(ctx) {
  await ctx.db.friends.clear();
  ctx.db.close();
}

async function read(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.friends.toArray();
  }

  console.log(
    `read in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function readInTransaction(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.transaction('rw', ctx.db.friends, async () => {
      await ctx.db.friends.toArray();
    });
  }

  console.log(
    `transaction read in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function readWhere(dbSize) {
  async function fn(ctx) {
    await ctx.db.friends.where({ name: 'vivaxy' }).toArray();
  }

  console.log(
    `read with where in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function readWhereInTransaction(dbSize) {
  async function fn(ctx) {
    await ctx.db.transaction('rw', ctx.db.friends, async () => {
      await ctx.db.friends.where({ name: 'vivaxy' }).toArray();
    });
  }

  console.log(
    `read with where in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function write(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.friends.put({ name: 'vivaxy', age: 20 });
  }

  console.log(
    `write in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function writeInTransaction(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.transaction('rw', ctx.db.friends, async () => {
      await ctx.db.friends.put({ name: 'vivaxy', age: 20 });
    });
  }

  console.log(
    `transaction write in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

(async () => {
  await open();
  await read(1);
  await read(10);
  await read(100);
  await read(1000);
  await read(10000);
  await readInTransaction(1);
  await readInTransaction(10);
  await readInTransaction(100);
  await readInTransaction(1000);
  await readInTransaction(10000);
  await readWhere(1);
  await readWhere(10);
  await readWhere(100);
  await readWhere(1000);
  await readWhere(10000);
  await readWhereInTransaction(1);
  await readWhereInTransaction(10);
  await readWhereInTransaction(100);
  await readWhereInTransaction(1000);
  await readWhereInTransaction(10000);
  await write(1);
  await write(10);
  await write(100);
  await write(1000);
  await write(10000);
  await write(10000);
  await writeInTransaction(1);
  await writeInTransaction(10);
  await writeInTransaction(100);
  await writeInTransaction(1000);
  await writeInTransaction(10000);
})();
