/**
 * @since 2023-03-28
 * @author vivaxy
 */
const fs = require('fs');
const Koa = require('koa');
const path = require('path');
const mime = require('mime');
const { Transform } = require('stream');

const app = new Koa();

function handleServer(ctx) {
  // otherwise node will automatically close this connection in 2 minutes
  ctx.req.setTimeout(Number.MAX_SAFE_INTEGER);

  ctx.type = 'text/event-stream; charset=utf-8';
  ctx.set('Cache-Control', 'no-cache');
  ctx.set('Connection', 'keep-alive');

  const body = new Transform();
  ctx.body = body;

  // if the connection closes or errors,
  // we stop the SSE.
  const socket = ctx.socket;
  socket.on('error', close);
  socket.on('close', close);

  function sendMessage(type, data) {
    body.push(`${type ? `event: ${type}\n` : ''}data: ${data}\n\n`);
  }

  let timer = setTimeout(function () {
    sendMessage('my-event', 'my-value');
    timer = setTimeout(function () {
      sendMessage('invalid-event', 'invalid-value');
      timer = setTimeout(function () {
        sendMessage(null, 'other-data');
        timer = setTimeout(function () {
          sendMessage(null, 'close');
        }, 1000);
      }, 1000);
    }, 1000);
  }, 1000);

  function close() {
    console.log('server close');
    clearTimeout(timer);
    socket.removeListener('error', close);
    socket.removeListener('close', close);
  }
}

app.use(async function (ctx) {
  if (ctx.path === '/server') {
    handleServer(ctx);
  } else {
    try {
      const content = fs.readFileSync(ctx.path.slice(1), 'utf8');
      ctx.body = content;
      ctx.type = mime.getType(path.extname(ctx.path));
    } catch (e) {
      ctx.status = 404;
    }
  }
});

app.listen(3000);
