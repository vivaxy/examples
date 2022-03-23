/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';
import { run } from '//cdn.skypack.dev/@vivaxy/framework/utils/benchmark.js';

const db = new Dexie('vivaxy-examples-benchmark-read-vs-read-where');
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

async function readWhere(dbSize = 0) {
  async function fn() {
    await db.transaction('rw', db.friends, async () => {
      await db.friends.where({ name: 'vivaxy' }).toArray();
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
await readWhere(1);
await readWhere(10);
await readWhere(100);
await readWhere(1000);
await readWhere(10000);
