/**
 * @since 2022-07-12 15:32
 * @author vivaxy
 */
import Dexie from 'https://cdn.skypack.dev/dexie';

const db = new Dexie('vivaxy');

db.version(1).stores({
  friends: '++id, name, age',
});

let age = Date.now();

async function write() {
  await db.friends.put({
    name: 'Foo',
    age,
  });
}

window.addEventListener('beforeunload', function () {
  db.transaction('rw', db.friends, async () => {
    await write();
  });
});
