/**
 * @since 20180614 11:10
 * @author vivaxy
 */

import Curve from '../class/curve.js';
import * as eventTypes from '../enums/event-types.js';
import * as layerIndexes from '../enums/layer-indexes.js';

function init(events) {
  const curves = [];
  let activeCurve = null;
  let newCurve = null;
  let startingHitCurve = null;

  events.on(eventTypes.ON_RENDER_PREPARING, onRenderPreparing);
  events.on(eventTypes.ON_DRAG_START, onDragStart);
  events.on(eventTypes.ON_DRAG_MOVE, onDragMove);
  events.on(eventTypes.ON_DRAG_END, onDragEnd);

  function onRenderPreparing(eventId, eventData) {
    curves.forEach((curve) => {
      if (curve.active) {
        eventData.layers.push({
          layerIndex: layerIndexes.ACTIVE_CURVE,
          actions: curve.render(),
        });
      } else {
        eventData.layers.push({
          layerIndex: layerIndexes.CURVE,
          actions: curve.render(),
        });
      }
    });
  }

  function onDragStart(eventId, eventData) {

    startingHitCurve = getHitCurve(eventData.startingPoint);
    if (startingHitCurve) {
      if (!activeCurve) {
        startingHitCurve.setActive(true);
      }
    } else {
      if (activeCurve) {
        activeCurve.setActive(false);
      }
      newCurve = new Curve({
        p1: eventData.startingPoint,
        cp1: eventData.startingPoint,
        cp2: eventData.startingPoint,
        p2: eventData.startingPoint,
      });
      curves.push(newCurve);
    }

    events.emit(eventTypes.APPLY_RENDER);
  }

  function onDragMove(eventId, eventData) {
    if (!startingHitCurve && newCurve) {
      newCurve.setP2(eventData.currentPoint);
      newCurve.setCp2(eventData.currentPoint);
    }
    events.emit(eventTypes.APPLY_RENDER);
  }

  function onDragEnd(eventId, eventData) {
    if (eventData.currentPoint.x === eventData.startingPoint.x && eventData.currentPoint.y === eventData.startingPoint.y) {
      if (startingHitCurve) {
        if (activeCurve) {
          // change selection
          trySelectAnotherCurve(eventData.startingPoint);
        } else {
          // select
          startingHitCurve.setActive(true);
          activeCurve = startingHitCurve;
          startingHitCurve = null;
        }
      } else if (newCurve) {
        // remove added new curve
        curves.splice(curves.indexOf(newCurve), 1);
        activeCurve.setActive(true);
        newCurve = null;
      } else {
        // deselect
        activeCurve.setActive(false);
        activeCurve = null;
      }
    } else {
      if (startingHitCurve) {
        startingHitCurve.setActive(false);
      } else if (newCurve) {
        activeCurve = newCurve;
        newCurve = null;
      }
    }

    events.emit(eventTypes.APPLY_RENDER);
  }

  function getHitCurve(coord) {
    for (let i = 0; i < curves.length; i++) {
      if (curves[i].isInCurve(coord)) {
        return curves[i];
      }
    }
    return null;
  }

  function trySelectAnotherCurve(coord) {
    let curveIndex = -1;
    for (let i = 0; i < curves.length; i++) {
      if (!curves[i].active && curves[i].isInCurve(coord)) {
        curveIndex = i;
        break;
      }
    }
    if (curveIndex !== -1) {
      const curve = curves[curveIndex];
      // change curve index, to loop the selection
      curves.splice(curveIndex, 1);
      curves.push(curve);
      activeCurve.setActive(false);
      curve.setActive(true);
      activeCurve = curve;
    }
  }
}

export default { init };
