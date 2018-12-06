/**
 * @since 2018-12-06 15:45
 * @author vivaxy
 */

import RenderLayer from './render-layer.js';

export default class RenderImage extends RenderLayer {

  constructor(url) {
    super();
    this.url = url;
    this.image = null;
  }

  renderOn(ctx) {
    ctx.drawImage(this.image, this.x, this.y, this.w, this.h);
  }
};
