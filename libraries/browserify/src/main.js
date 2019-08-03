/**
 * @since 150517 20:08
 * @author vivaxy
 */
var Canvas = require('./canvas'),
  Dot = require('./dot'),
  url = require('url'),
  querystring = require('querystring'),
  canvas = new Canvas(),
  ctx = canvas.getCtx(),
  length = parseInt(querystring.parse(url.parse(location.href).query).length);

for (var i = 0; i < length; i++) {
  new Dot({
    x: i,
    y: i,
    ctx: ctx,
  });
}
