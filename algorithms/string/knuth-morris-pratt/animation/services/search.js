/**
 * @since 2024-02-16
 * @author vivaxy
 */
import * as EVENTS from '../enums/events.js';

/**
 * @typedef {import('../utils/types.js').EventEmitter} EventEmitter
 */

/**
 * @param {EventEmitter} events
 */
export function initSearch(events) {
  let stage = 0;
  events.on(EVENTS.STAGE, function ({ value }) {
    stage = value;
  });
  events.on(EVENTS.SET_VALUE, function (...args) {
    if (stage !== 1) {
      console.log('SET_VALUE', ...args);
    }
  });
  events.on(EVENTS.COMPARE, function (...args) {
    if (stage !== 1) {
      console.log('COMPARE', ...args);
    }
  });
  events.on(EVENTS.RESULT, function (...args) {
    if (stage !== 1) {
      console.log('RESULT', ...args);
    }
  });
}
