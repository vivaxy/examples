/**
 * @since 2022-01-20
 * @author vivaxy
 */
import Dexie from 'https://cdn.skypack.dev/dexie';

const db = new Dexie('vivaxy');

db.version(1).stores({
  friends: '++id, name, age',
});

const age = Math.round(Math.random() * 100);

async function write() {
  await db.friends.put({
    id: Math.round(Math.random() * 10),
    name: 'Foo',
    age,
  });
}

async function read() {
  const friends = await db.friends.toArray();
  console.log('read done', friends);
}

db.transaction('rw', db.friends, async () => {
  console.log('transaction start');
  for (let i = 0; i < 1e4; i++) {
    await write();
    if (i === 0) {
      console.log('first write done');
    }
  }
  await read();
})
  .then((result) => {
    console.log('transaction succeed', result);
  })
  .catch((error) => {
    console.error('transaction failed', error);
  });
