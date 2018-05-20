/**
 * @since 2018-05-20 13:52:37
 * @author vivaxy
 */

import query from './utils/query.js';
import EventEmitter from './class/event-emitter.js';
import * as EVENT_TYPES from './enums/event-types.js';
import generateUnsortedArray from './services/unsorted-array.js';
import animationActions from './services/animation-actions.js';
import algorithm from './services/algorithm.js';

const events = new EventEmitter();

generateUnsortedArray.init(events);
animationActions.init(events);
algorithm.init(events);

events.emit(EVENT_TYPES.REQUEST_AN_UNSORTED_ARRAY, { arrayLength: query.length });
