/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';
import { run } from '//cdn.skypack.dev/@vivaxy/framework/utils/benchmark.js';

const db = new Dexie('vivaxy-examples-common-api');
db.version(1).stores({
  friends: '&id, name',
});
await db.open();

function getBeforeAll(dbSize) {
  return async function beforeAll() {
    await db.friends.bulkPut(
      Array.from({ length: dbSize }, (_, i) => {
        return {
          id: i,
          name: 'vivaxy',
          age: i,
        };
      }),
    );
  };
}

async function afterAll() {
  await db.friends.clear();
}

async function get(dbSize = 0) {
  async function fn() {
    const a = await db.friends.get({ name: 'vivaxy' });
  }
  console.log(
    `get in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function sortBy(dbSize = 0) {
  async function fn() {
    const a = await db.friends.where({ name: 'vivaxy' }).toArray();
  }
  console.log(
    `sortBy in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

await get(1);
await get(10);
await get(100);
await get(1000);
await get(10000);
await sortBy(1);
await sortBy(10);
await sortBy(100);
await sortBy(1000);
await sortBy(10000);
