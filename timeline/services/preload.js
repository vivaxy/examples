/**
 * @since 2018-12-06 15:39
 * @author vivaxy
 */

import * as ET from '../enums/event-types.js';
import RenderText from '../class/render-text.js';

function init(e) {

  let total = 0;
  let loaded = 0;
  let renderText = new RenderText('Loading 0%');

  e.emit(ET.ADD_RENDER_LAYERS, renderText);

  e.on(ET.ADD_PRELOAD_ASSETS, (et, ed) => {
    for (let name in ed) {
      const asset = ed[name];
      asset.image = new Image();
      asset.image.addEventListener('load', () => {
        loaded++;
        updateText();
        e.emit(ET.ASSETS_PRELOAD_PROGRESS, { loaded, total });
        if (loaded === total) {
          e.emit(ET.REMOVE_RENDER_LAYERS, renderText);
        }
      });
      asset.image.src = asset.url;
      total++;
    }
  });

  e.on(ET.PAGE_LOAD, updateText);

  function updateText() {
    renderText.text = `Loading ${Math.floor(loaded / total * 100)}%`;
  }
}

export default { init };
