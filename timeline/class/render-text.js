/**
 * @since 2018-12-06 16:16
 * @author vivaxy
 */

import RenderLayer from './render-layer.js';

export default class RenderText extends RenderLayer {
  constructor(text) {
    super();
    this.text = text;
  }

  renderOn(ctx, canvas) {
    ctx.fillStyle = '#000';
    ctx.font = '50px serif';
    ctx.textAlign = 'center';
    ctx.fillText(this.text, canvas.width / 2, canvas.height / 2);
  }
}
