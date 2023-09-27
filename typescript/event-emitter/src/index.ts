/**
 * @since 2023-08-14
 * @author vivaxy
 */
import { eventEmitter } from './event-emitter';
import { EVENTS } from './event-protocol';

eventEmitter.on(EVENTS.LOAD, function () {});

eventEmitter.on(EVENTS.SCROLL, function (a) {});

eventEmitter.on(EVENTS.RESIZE, function (a, b) {});
