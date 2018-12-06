/**
 * @since 20180709 16:47
 * @author vivaxy
 */

import EventEmitter from '../../event-based-framework/class/event-emitter.js';
import idb from './services/idb.js';
import idbVersion from './services/idb-version.js';
import tables from './services/tables.js';

const events = new EventEmitter();

idb.init(events);
idbVersion.init(events);
tables.init(events);
