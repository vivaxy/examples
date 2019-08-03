/**
 * @since 150517 20:07
 * @author vivaxy
 */
var Dot = function(options) {
    this.x = options.x;
    this.y = options.y;
    this.ctx = options.ctx;
    this.ctx.fillStyle = options.color;

    this.render();
  },
  p = {};

Dot.prototype = p;

p.render = function() {
  this.ctx.fillRect(this.x, this.y, 1, 1);
  return this;
};

module.exports = Dot;
