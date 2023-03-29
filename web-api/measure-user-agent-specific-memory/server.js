/**
 * @since 2023-03-28
 * @author vivaxy
 */
const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const mime = require('mime');

const app = new Koa();

const PORT = 3002;

app.use(async function (ctx) {
  try {
    const content = fs.readFileSync(ctx.path.slice(1), 'utf8');
    ctx.body = content;
    ctx.type = mime.getType(path.extname(ctx.path));
    if (ctx.path === '/index.html') {
      ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
      ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
      // ctx.set('Origin-Agent-Cluster', '?1');
      // ctx.set('Cross-Origin-Opener-Policy-Report-Only', 'same-origin; report-to="//localhost:3002/coop-errors"');
      // ctx.set('Cross-Origin-Embedder-Policy-Report-Only', 'require-corp; report-to="//localhost:3002/coep-errors"');
    }
  } catch (e) {
    ctx.status = 404;
  }
});

app.listen(PORT);
console.log('server started: http://127.0.0.1:' + PORT);
