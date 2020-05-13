/**
 * @since 2020-05-08 20:02
 * @author vivaxy
 */
const Koa = require('koa');

const app = new Koa();

app.use(async function(ctx) {
  if (ctx.path === '/index.html') {
    ctx.body = `<html><head>Redirect Server</head><body><script src="/redirect.js"></script></body></html>`;
    return;
  }
  const redirectURL = 'dianping://user';
  ctx.body = redirectURL;
  if (ctx.headers['user-agent'].includes('dianping')) {
    ctx.redirect(redirectURL);
  }
});

app.listen(3000);
