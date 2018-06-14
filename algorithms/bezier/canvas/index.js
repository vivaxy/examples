/**
 * @since 20180613 20:09
 * @author vivaxy
 */

import './debug/assert.js';
import * as eventTypes from './enums/event-types.js';
import EventEmitter from '../../_animation/class/event-emitter.js';

import baseCanvas from './service/base-canvas.js';
import layerRenderer from './service/layer-renderer.js';
import sortRenderLayer from './service/sort-render-layer.js';
import canvasDpr from './service/canvas-dpr.js';
import buttons from './service/buttons.js';

const events = new EventEmitter();

baseCanvas.init(events);
layerRenderer.init(events);
sortRenderLayer.init(events);
canvasDpr.init(events);
buttons.init(events);

events.emit(eventTypes.APPLY_RENDER);
