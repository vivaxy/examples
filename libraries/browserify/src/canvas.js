/**
 * @since 150517 20:07
 * @author vivaxy
 */
var Canvas = function() {
    var canvas = (this.canvas = document.createElement('canvas'));
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    this.render();
  },
  p = {};

Canvas.prototype = p;

p.render = function() {
  var body = document.getElementById('body');
  body.appendChild(this.canvas);
  return this;
};

p.getCtx = function() {
  return this.canvas.getContext('2d');
};

module.exports = Canvas;
