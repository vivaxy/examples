/**
 * @since 2021-10-25
 * @author vivaxy
 */
const Koa = require('koa');
const { log, middleware } = require('./lib');

function sleep(timeout) {
  return new Promise(function (resolve) {
    log('before sleep');
    setTimeout(function () {
      log('after sleep');
      resolve();
    }, timeout);
  });
}

async function main(ctx, next) {
  log('start');
  await sleep(100);
  log('end');
  ctx.body = 'ok';
  await next();
}

const koa = new Koa();
koa.use(middleware);
koa.use(main);
koa.on('error', function (err) {
  console.error(err);
});
koa.listen(8080, function () {
  console.log('server started on 8080');
});
