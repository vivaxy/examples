/**
 * @since 2022-03-14
 * @author vivaxy
 */
import Dexie from 'https://cdn.skypack.dev/dexie';

const db = new Dexie('vivaxy');

db.version(1).stores({
  friends: '++id, name, age',
});

function randomAge() {
  return Math.round(Math.random() * 100);
}

async function clear() {
  return await db.friends.clear();
}

async function write() {
  await db.friends.put({
    id: Math.round(Math.random() * 10),
    name: 'Foo',
    age: randomAge(),
  });
}

async function read() {
  const friends = await db.friends.toArray();
  console.log('read', friends);
  return friends[0].id;
}

async function update(id) {
  await db.friends.update(id, {
    name: 'Foo-Updated',
    age: randomAge(),
  });
}

function reject(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'));
    }, timeout);
  });
}

function withTimeout(asyncFunction, timeout) {
  return Promise.all([asyncFunction(), reject(timeout)]);
}

db.transaction('rw', db.friends, async () => {
  console.time('transaction');
  try {
    await withTimeout(async function () {
      console.time('transaction-inner');
      await clear();
      await write();
      const id = await read();
      await update(id);
      await read();
      console.timeEnd('transaction-inner');
    }, 10);
  } catch (e) {
    console.error(e);
  } finally {
    console.timeEnd('transaction');
  }
});
