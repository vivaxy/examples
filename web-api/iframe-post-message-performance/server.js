/**
 * @since 2022-12-05 16:46
 * @author vivaxy
 */
const fs = require('fs');
const Koa = require('koa');
const mime = require('mime');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

async function originAgentClusterMiddleware(ctx, next) {
  if (ctx.path === '/iframe.html') {
    ctx.set('Origin-Agent-Cluster', '?1');
  }
}

async function staticMiddleware(ctx, next) {
  try {
    const fileName = ctx.path.slice(1) || 'index.html';
    ctx.body = readFile(fileName);
    ctx.type = mime.getType(fileName);
  } catch (e) {}
  await next();
}

const appIndex = new Koa();
appIndex.use(staticMiddleware);
appIndex.listen(3456);

const appIframeOriginAgentClusterEnabled = new Koa();
appIframeOriginAgentClusterEnabled.use(staticMiddleware);
appIframeOriginAgentClusterEnabled.use(originAgentClusterMiddleware);
appIframeOriginAgentClusterEnabled.listen(3457);

const appIframe = new Koa();
appIframe.use(staticMiddleware);
appIframe.listen(3458);
