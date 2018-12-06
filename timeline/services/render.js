/**
 * @since 2018-12-06 15:46
 * @author vivaxy
 */

import * as ET from '../enums/event-types.js';

function init(e) {

  const canvas = document.querySelector('canvas');
  canvas.width = window.innerWidth * window.devicePixelRatio;
  canvas.height = window.innerHeight * window.devicePixelRatio;
  const ctx = canvas.getContext('2d');

  let layers = [];

  const render = () => {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    layers.forEach((layer) => {
      layer.renderOn(ctx, canvas);
    });

    requestAnimationFrame(render);
  };

  e.on(ET.ADD_RENDER_LAYERS, onAddRenderLayers);
  e.on(ET.REMOVE_RENDER_LAYERS, onRemoveRenderLayers);

  render();

  function onAddRenderLayers(et, ed) {
    if (ed) {
      layers = layers.concat(ed);
    }
  }

  function onRemoveRenderLayers(et, ed) {
    if (ed) {
      let toRemoved = ed;
      if (!Array.isArray(ed)) {
        toRemoved = [ed];
      }

      toRemoved.forEach((toRemovedItem) => {
        const i = layers.indexOf(toRemovedItem);
        if (i !== -1) {
          layers.splice(i, 1);
        }
      });
    }
  }

}

export default { init };
