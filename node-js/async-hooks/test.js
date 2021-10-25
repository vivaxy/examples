/**
 * @since 2021-10-25
 * @author vivaxy
 */
const Koa = require('koa');
const { log, hook } = require('./index');

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
  hook.enable();
  log('start');
  await sleep(100);
  log('end');
  ctx.body = 'ok';
  hook.disable();
}

const koa = new Koa();
koa.use(main);
koa.listen(8080);
