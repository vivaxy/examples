/**
 * @since 20180614 10:33
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';

function init(events) {
  events.on(eventTypes.ON_RENDER_PREPARED, onRenderPrepared);

  function onRenderPrepared(eventId, eventData) {
    eventData.layers = eventData.layers.sort((p, n) => {
      return p.layerIndex - n.layerIndex;
    });
  }
}

export default { init };
