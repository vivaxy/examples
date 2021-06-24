/**
 * @since 2021-06-24
 * @author vivaxy
 */
import EventEmitter from '//esm.run/@vivaxy/framework/class/event-emitter2.js';
import input from './services/input.js';
import doc from './services/doc.js';
import output from './services/output.js';
import * as E from './enums/event-types.js';

const e = new EventEmitter();

input.init(e);
doc.init(e);
output.init(e);

e.emit(E.OPEN_A_NEW_DOC);
