/**
 * @since 2021-02-18 15:23
 * @author vivaxy
 * 2 ways of getting request header size
 * 1. bytesRead - previousBytesRead
 * 2. byteLength(socket.data)
 */
const http = require('http');
const { Buffer } = require('buffer');

let lastBytesRead = 0;
const server = http.createServer(function (req, res) {
  res.end('size: ' + (res.socket.bytesRead - lastBytesRead) + ' bytes');
  lastBytesRead = res.socket.bytesRead;
});

// server.on('connection', function (socket) {
//   let data = '';
//   socket.on('data', function (chunk) {
//     data += String(chunk);
//   });
//   socket.on('end', function () {
//     console.log('size', Buffer.byteLength(data));
//   });
// });

server.listen(8000);
