/**
 * @since 20180613 21:23
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';
import * as actionTypes from '../enums/layer-actions.js';
import * as layerProperties from '../enums/layer-properties.js';
import * as layerFunctions from '../enums/layer-functions.js';

function init(events) {
  events.on(eventTypes.ON_RENDER_PREPARED, onRenderPrepared);

  const dpr = window.devicePixelRatio;

  function onRenderPrepared(eventId, eventData) {
    eventData.layers.forEach((layer) => {
      if (layer.actions) {
        layer.actions.forEach((action) => {
          if (action.type === actionTypes.FUNCTION) {
            let indexes = [];
            switch (action.func) {
              case layerFunctions.MOVE_TO:
              case layerFunctions.LINE_TO:
                indexes = [0, 1];
                break;
              case layerFunctions.FILL_TEXT:
                indexes = [1, 2, 3];
                break;
              case layerFunctions.RECT:
              case layerFunctions.FILL_RECT:
              case layerFunctions.STROKE_RECT:
                indexes = [0, 1, 2, 3];
                break;
              case layerFunctions.BEZIER_CURVE_TO:
                indexes = [0, 1, 2, 3, 4, 5];
                break;
              case layerFunctions.ARC:
                indexes = [0, 1, 2];
                break;
              default:
                // do nothing
                break;
            }
            indexes.forEach((index) => {
              if (typeof action.params[index] === 'number') {
                action.params[index] *= dpr;
              }
            });
          } else if (action.type === actionTypes.PROPERTY) {
            switch (action.prop) {
              case layerProperties.LINE_WIDTH:
                action.value *= dpr;
                break;
              default:
                // do nothing
                break;
            }
          } else if (action.type === actionTypes.SET_FONT) {
            action.fontSize *= dpr;
            action.lineHeight *= dpr;
          } else {
            ASSERT(false, 'Unexpected action.type: ' + action.type);
          }
        });
      }
    });

  }

}

export default { init };
