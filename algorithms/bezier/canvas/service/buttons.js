/**
 * @since 20180613 20:16
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';
import * as layerIndexes from '../enums/layer-indexes.js';
import Button from '../class/button.js';

function init(events) {
  const resetButton = new Button({ label: 'Reset', left: 0, top: 0, width: 32, height: 32 });

  events.on(eventTypes.ON_RENDER_PREPARING, onRenderPreparing);
  events.on(eventTypes.ON_CANVAS_TOUCH_START, onCanvasTouchStart);
  events.on(eventTypes.ON_CANVAS_TOUCH_END, onCanvasTouchEnd);

  function onRenderPreparing(eventId, eventData) {
    eventData.layers.push({
      layerIndex: layerIndexes.BUTTON,
      actions: resetButton.render(),
    });
  }

  let startWithInResetButton = false;
  function onCanvasTouchStart(eventId, eventData) {
    if (resetButton.coordsInButton(eventData)) {
      startWithInResetButton = true;
      eventData.button = resetButton;
    }
  }

  function onCanvasTouchEnd(eventId, eventData) {
    if (startWithInResetButton && resetButton.coordsInButton(eventData)) {
      eventData.button = resetButton;
      handleReset();

      startWithInResetButton = false;
    }
  }

  function handleReset() {
    console.log('handleReset');
  }

}

export default { init };
