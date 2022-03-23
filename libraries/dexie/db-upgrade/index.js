/**
 * @since 2022-03-23
 * @author vivaxy
 */
import Dexie from 'https://cdn.skypack.dev/dexie';
import { DB_NAME } from './common.js';

document
  .getElementById('delete-db')
  .addEventListener('click', async function () {
    await Dexie.delete(DB_NAME);
    console.log('DB deleted');
  });
