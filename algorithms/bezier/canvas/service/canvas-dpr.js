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
            switch (action.func) {
              case layerFunctions.FILL_TEXT:
                action.params[1] *= dpr; // x
                action.params[2] *= dpr; // y
                if (action.params[3] !== undefined) {
                  action.params[3] *= dpr; // maxWidth
                }
                break;
              case layerFunctions.RECT:
              case layerFunctions.FILL_RECT:
              case layerFunctions.STROKE_RECT:
                action.params[0] *= dpr; // x
                action.params[1] *= dpr; // y
                action.params[2] *= dpr; // w
                action.params[3] *= dpr; // h
                break;
              default:
                // do nothing
                break;
            }
          } else if (action.type === actionTypes.PROPERTY) {
            switch (action.prop) {
              default:
                // do nothing
                break;
            }
          } else if (action.type === actionTypes.SET_FONT) {
            action.fontSize *= dpr;
            action.lineHeight *= dpr;
          } else {
            ASSERT(false, 'Unexpected action.type: '+ action.type);
          }
        });
      }
    });

  }

}

export default { init };
