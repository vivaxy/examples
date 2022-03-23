/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from 'https://cdn.skypack.dev/dexie';
import { DB_NAME, bindCRDUHandlers } from './common.js';

const db = new Dexie(DB_NAME);
db.version(1).stores({
  friends: '++id',
});

bindCRDUHandlers(db);
