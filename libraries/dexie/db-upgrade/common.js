/**
 * @since 2022-03-23
 * @author vivaxy
 */
export const DB_NAME = 'vivaxy-example-db-upgrade';

const handlers = {
  async get(db) {
    const data = await db.friends.toArray();
    console.log('get data:', data);
  },
  async put(db) {
    const put = await db.friends.put({ name: 'vivaxy' });
    console.log(`put ${put} entries`);
  },
  async update(db) {
    const updated = await db.friends.update(1, { name: 'vivaxy-updated' });
    console.log(`update ${updated} entries`);
  },
  async delete(db) {
    await db.friends.delete(1);
    console.log(`deleted`);
  },
};

export function bindCRDUHandlers(db) {
  Object.keys(handlers).forEach(function (key) {
    document.getElementById(key).addEventListener('click', async function () {
      await handlers[key](db);
    });
  });
}
