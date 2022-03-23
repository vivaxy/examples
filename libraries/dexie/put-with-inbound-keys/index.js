/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from '//cdn.skypack.dev/dexie';

const db = new Dexie('vivaxy-examples-put-with-inbound-keys');
db.version(1).stores({
  friends: '&id',
});

const put = await db.friends.put({ id: 1, name: 'vivaxy' });
console.log('put', put, 'entries', await db.friends.toArray());
// all ok
const updated = await db.friends.put({ id: 1, name: 'vivaxy2' }, 1);
console.log('updated', updated, 'entries', await db.friends.toArray());
// all ok
const updated2 = await db.friends.put({ id: 1, name: 'vivaxy3' }, [1]);
console.log('updated', updated2, 'entries', await db.friends.toArray());
