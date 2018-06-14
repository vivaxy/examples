/**
 * @since 20180614 11:56
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';

function init(events) {
  events.on(eventTypes.ON_CANVAS_TOUCH_START, onCanvasTouchStart);
  events.on(eventTypes.ON_CANVAS_TOUCH_MOVE, onCanvasTouchMove);
  events.on(eventTypes.ON_CANVAS_TOUCH_END, onCanvasTouchEnd);

  let startingPoint = null;
  let currentPoint = null;

  function onCanvasTouchStart(eventId, eventData) {
    if (eventData.button) {
      return;
    }
    startingPoint = eventData;
    events.emit(eventTypes.ON_DRAG_START, {
      startingPoint
    });
  }

  function onCanvasTouchMove(eventId, eventData) {
    if (startingPoint) {
      events.emit(eventTypes.ON_DRAG_MOVE, {
        startingPoint,
        previousPoint: currentPoint,
        currentPoint: eventData,
      });
      currentPoint = eventData;
    }
  }

  function onCanvasTouchEnd(eventId, eventData) {
    if (startingPoint) {
      events.emit(eventTypes.ON_DRAG_END, {
        startingPoint,
        previousPoint: currentPoint,
        currentPoint: eventData,
      });
      startingPoint = null;
      currentPoint = null;
    }
  }
}

export default { init };
