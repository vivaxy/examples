/**
 * @since 2018-12-06 15:46
 * @author vivaxy
 */

import * as ET from '../enums/event-types.js';
import RenderImage from '../class/render-image.js';

function init(e) {

  const assets = {
    watch: 'assets/watch.png',
    talk: 'assets/talk.png',
    pointer1: 'assets/pointer1.png',
    pointer2: 'assets/pointer2.png',
  };

  for (let name in assets) {
    assets[name] = new RenderImage(assets[name]);
  }

  e.on(ET.ASSETS_PRELOAD_PROGRESS, (et, ed) => {
    if (ed.loaded === ed.total) {
      e.emit(ET.ADD_RENDER_LAYERS, [assets.watch, assets.talk, assets.pointer1, assets.pointer2]);
    }
  });

  e.on(ET.PAGE_LOAD, () => {
    e.emit(ET.ADD_PRELOAD_ASSETS, assets);
  });

}

export default { init };
