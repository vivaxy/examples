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
export function initDebug(events) {
  events.on(EVENTS.INIT_INFO, function (args) {
    console.log('INIT_INFO', args);
  });
  events.on(EVENTS.STAGE, function (args) {
    console.log('STAGE', args);
  });
  events.on(EVENTS.SET_VALUE, function (args) {
    console.log('SET_VALUE', args);
  });
  events.on(EVENTS.COMPARE, function (args) {
    console.log('COMPARE', args);
  });
  events.on(EVENTS.RESULT, function (args) {
    console.log('RESULT', args);
  });
}
