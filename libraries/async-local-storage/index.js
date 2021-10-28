/**
 * @since 2021-10-28
 * @author vivaxy
 */
const Koa = require('koa');
const als = require('async-local-storage');

const koa = new Koa();
als.enable();

let contextId = 1;
koa.use(async function (ctx, next) {
  const id = contextId++;
  // als.scope();
  als.set('contextId', id);
  await next();
});

function log(msg) {
  const contextId = als.get('contextId');
  console.log(contextId, msg);
}

function sleep(timeout) {
  return new Promise(function (resolve) {
    log('before sleep');
    setTimeout(function () {
      log('after sleep');
      resolve();
    }, timeout);
  });
}

koa.use(async function main(ctx, next) {
  log('start');
  await sleep(100);
  log('end');
  ctx.body = 'ok';
  await next();
});

koa.listen(8080);
