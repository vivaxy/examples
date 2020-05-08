/**
 * @since 2020-05-08 20:02
 * @author vivaxy
 */
const Koa = require('koa');

const app = new Koa();

app.use(async function(ctx) {
  const redirectURL = 'dianping://user';
  ctx.body = redirectURL;
  if (ctx.headers['user-agent'].includes('dianping')) {
    ctx.redirect(redirectURL);
  }
});

app.listen(3000);
