import Dexie from 'https://cdn.skypack.dev/dexie';
import { DB_NAME, bindCRDUHandlers } from './common.js';

document
  .getElementById('upgrade-db')
  .addEventListener('click', async function () {
    const db = new Dexie(DB_NAME);
    db.version(2).stores({
      friends: '++id, age',
    });
    bindCRDUHandlers(db);
  });
