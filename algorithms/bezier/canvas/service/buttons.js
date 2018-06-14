/**
 * @since 20180613 20:16
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';
import * as layerIndexes from '../enums/layer-indexes.js';
import Button from '../class/button.js';

function init(events) {
  const resetButton = new Button({ label: 'Reset', left: 0, top: 0, width: 60, height: 32 });

  events.on(eventTypes.ON_RENDER_PREPARING, onRenderPreparing);
  events.on(eventTypes.ON_CANVAS_CLICK, onCanvasClick);

  function onRenderPreparing(eventId, eventData) {
    eventData.layers.push({
      layerIndex: layerIndexes.BUTTON,
      actions: resetButton.render(),
    });
  }

  function onCanvasClick(eventId, eventData) {
    if (resetButton.coordsInButton(eventData)) {
      events.emit(eventTypes.ON_BUTTON_CLICK, { ...eventData, button: resetButton });
    } else {
      events.emit(eventTypes.ON_EMPTY_SPACE_CLICK, eventData);
    }
  }

}

export default { init };
