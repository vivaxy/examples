/**
 * @since 2018-12-06 15:35
 * @author vivaxy
 */

import EventEmitter from '../event-based-framework/class/event-emitter.js';
import renderService from './services/render.js';
import preloadService from './services/preload.js';
import tickLoopService from './services/tick-loop.js';
import timelineService from './services/timeline.js';
import assetsService from './services/assets.js';
import * as ET from './enums/event-types.js';

const eventEmitter = new EventEmitter();

renderService.init(eventEmitter);
preloadService.init(eventEmitter);
tickLoopService.init(eventEmitter);
assetsService.init(eventEmitter);

if (document.readyState === 'complete') {
  eventEmitter.emit(ET.PAGE_LOAD);
} else {
  window.addEventListener('load', () => {
    eventEmitter.emit(ET.PAGE_LOAD);
  });
}
