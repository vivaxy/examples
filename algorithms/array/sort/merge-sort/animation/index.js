/**
 * @since 2018-05-20 13:52:37
 * @author vivaxy
 */

import Query from './class/query.js';
import EventEmitter from './class/event-emitter.js';
import * as EVENT_TYPES from './enums/event-types.js';
import generateUnsortedArray from './services/unsorted-array.js';
import animationActions from './services/animation-actions.js';
import algorithm from './services/algorithm.js';

const params = [
  {
    name: 'interval',
    format(input) {
      const value = Number(input);
      if (Number.isNaN(value)) {
        return this.defaultValue;
      }
      if (value < 0) {
        return this.defaultValue;
      }
      return value;
    },
    defaultValue: 1000,
  },
  {
    name: 'length',
    format(input) {
      const value = Number(input);
      if (Number.isNaN(value)) {
        return this.defaultValue;
      }
      if (value <= 0) {
        return this.defaultValue;
      }
      return value;
    },
    defaultValue: 10,
  },
];

const query = new Query({ params });
const events = new EventEmitter();

generateUnsortedArray.init(events);
animationActions.init(events, query);
algorithm.init(events);

events.emit(EVENT_TYPES.REQUEST_AN_UNSORTED_ARRAY, { arrayLength: query.length });
