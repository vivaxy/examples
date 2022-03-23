/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';
import { run } from '//cdn.skypack.dev/@vivaxy/framework/utils/benchmark.js';

const db = new Dexie('vivaxy-examples-benchmark-read-vs-read-in-transaction');
db.version(1).stores({
  friends: '&id, [name+age], info',
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
          info: {
            name: 'vivaxy',
            age: i,
          },
        };
      }),
    );
  };
}

async function afterAll() {
  await db.friends.clear();
}

async function read(dbSize = 0) {
  async function fn() {
    await db.friends.toArray();
  }

  console.log(
    `read in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

async function readInTransaction(dbSize = 0) {
  async function fn() {
    await db.transaction('rw', db.friends, async () => {
      await db.friends.toArray();
    });
  }

  console.log(
    `transaction read in ${dbSize} line(s) table`,
    await run(fn, { beforeAll: getBeforeAll(dbSize), afterAll }),
  );
}

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
