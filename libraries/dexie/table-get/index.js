/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';

const db = new Dexie('vivaxy-example-table-get');
db.version(1).stores({
  friends: '&id, age',
});

await db.friends.put({ id: 1, age: 20, name: '1', seq: 1 });
await db.friends.put({ id: 2, age: 20, name: '2', seq: 2 });
await db.friends.put({ id: 1, age: 20, name: '1.1', seq: 3 });
console.log(await db.friends.get({ age: 20 }));
