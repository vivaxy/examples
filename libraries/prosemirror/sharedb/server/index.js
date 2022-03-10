/**
 * @since 2022-03-10
 * @author vivaxy
 */
const http = require('http');
const Koa = require('koa');
const WebSocket = require('ws');
const ShareDB = require('sharedb');
const WebSocketJSONStream = require('@teamwork/websocket-json-stream');

const networkLatency = 0;

const backend = new ShareDB();

const koa = new Koa();
const server = http.createServer(koa.callback());

const webSocketServer = new WebSocket.Server({ server: server });

const sockets = new Set();

webSocketServer.on('connection', function (socket) {
  sockets.add(socket);

  const stream = new WebSocketJSONStream(socket);
  backend.listen(stream);

  socket.on('close', function () {
    sockets.delete(socket);
  });
});

const port = 8000;

server.listen(port, () => {
  console.log('listening on', server.address());
});
