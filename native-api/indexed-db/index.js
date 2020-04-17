/**
 * @since 20180709 16:47
 * @author vivaxy
 */
import EventEmitter from 'https://unpkg.com/event-based-framework/class/event-emitter.js';
import idb from './services/idb.js';
import idbVersion from './services/idb-version.js';
import tables from './services/tables.js';
import './components/add-table.js';
import './components/idb-table.js';
import './components/delete-table.js';
import './components/table-data.js';
import './components/add-column.js';
import './components/add-row.js';
import './components/table-cell.js';
import './components/delete-row.js';
import './components/delete-column.js';

const events = new EventEmitter();

idb.init(events);
idbVersion.init(events);
tables.init(events);
