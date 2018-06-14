/**
 * @since 20180614 10:10
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';

function init(events) {

  let needUpdate = true;

  renderLoop();

  events.on(eventTypes.APPLY_RENDER, onApplyRender);

  function onApplyRender(eventId, eventData) {
    needUpdate = true;
  }

  function render() {
    needUpdate = false;

    let layers = [];
    events.emit(eventTypes.ON_RENDER_PREPARING, { layers });
    events.emit(eventTypes.ON_RENDER_PREPARED, { layers });
    events.emit(eventTypes.ON_RENDERING, { layers });
    events.emit(eventTypes.ON_RENDERED, { layers });

    // console.log('render');
  }

  function renderLoop() {
    if (needUpdate) {
      render();
    }
    requestAnimationFrame(renderLoop);
  }

}

export default { init };
