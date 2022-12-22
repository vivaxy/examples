/**
 * @since 2022-12-22 19:34
 * @author vivaxy
 */
const fs = require('fs');
const Koa = require('koa');
const mime = require('mime');
const https = require('https');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

async function staticMiddleware(ctx, next) {
  try {
    const fileName = ctx.path.slice(1) || 'index.html';
    ctx.body = readFile(fileName);
    ctx.type = mime.getType(fileName);
    if (fileName === 'index.html') {
      ctx.set('Origin-Agent-Cluster', '?1');

      ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
      ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
      ctx.set('Cross-Origin-Resource-Policy', 'cross-origin');
    }
  } catch (e) {}
  await next();
}
const app = new Koa();
app.use(staticMiddleware);

const options = {
  key: fs.readFileSync('./server.key', 'utf8'),
  cert: fs.readFileSync('./server.cert', 'utf8'),
};
https.createServer(options, app.callback()).listen(3000);
