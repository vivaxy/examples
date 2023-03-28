/**
 * @since 2023-03-28
 * @author vivaxy
 */
const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const mime = require('mime');

const app = new Koa();

app.use(async function (ctx) {
  try {
    const content = fs.readFileSync(ctx.path.slice(1), 'utf8');
    ctx.body = content;
    ctx.type = mime.getType(path.extname(ctx.path));
    if (ctx.path === '/index.html') {
      ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
      ctx.set('Cross-Origin-Opener-Policy', 'same-site');
    }
  } catch (e) {
    ctx.status = 404;
  }
});

app.listen(3000);
console.log('server started: http://127.0.0.1:3000');
