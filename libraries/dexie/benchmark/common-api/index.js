/**
 * @since 2022-03-14
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';
import { run } from '//cdn.skypack.dev/@vivaxy/framework/utils/benchmark.js';

async function openTable(ctx) {
  const db = new Dexie('vivaxy-examples-common-api');
  db.version(1).stores({
    friends: '&id, [name+age], info',
  });
  await db.open();
  ctx.db = db;
  return db;
}

async function open() {
  function afterEach(ctx) {
    ctx.db.close();
  }

  console.log('open', await run(openTable, { afterEach }));
}

function getBeforeAll(dbSize) {
  return async function beforeAll(ctx) {
    const db = await openTable(ctx);
    await db.friends.bulkPut(
      Array.from({ length: dbSize }, (_, i) => {
        return {
          id: i,
          name: 'vivaxy',
          age: i,
          info: {
            name: 'vivaxy',
            age: i,
          },
        };
      }),
    );
  };
}

async function afterAll(ctx) {
  const { db } = ctx;
  await db.friends.clear();
  db.close();
}

async function read(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.friends.toCollection().last();
  }

  console.log(
    `read in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function write(dbSize = 0) {
  async function fn(ctx) {
    await ctx.db.friends.put({
      id: 999999,
      name: 'vivaxy',
      age: 20,
      info: { name: 'vivaxy', age: 20 },
    });
  }

  console.log(
    `write in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

(async () => {
  await open();
  await read(1);
  await write(1);
})();
