/**
 * @since 2021-10-28
 * @author vivaxy
 */
const Koa = require('koa');
const { log, asyncLocalStorageMiddleware } = require('./lib');

function sleep(timeout) {
  return new Promise(function (resolve) {
    log('before sleep');
    setTimeout(function () {
      log('after sleep');
      resolve();
    }, timeout);
  });
}

async function main(ctx) {
  log('start');
  await sleep(100);
  log('end');
  ctx.body = 'ok';
}

const koa = new Koa();
koa.use(asyncLocalStorageMiddleware);
koa.use(main);
koa.listen(8080);
