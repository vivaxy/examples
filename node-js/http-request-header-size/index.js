/**
 * @since 2021-02-18 15:23
 * @author vivaxy
 * 2 ways of getting request header size
 * 1. bytesRead - previousBytesRead
 * 2. byteLength(socket.data)
 */
const http = require('http');
const { Buffer } = require('buffer');

const PORT = 3000;
const server = http.createServer(function (req, res) {
  const { socket } = req;
  const size = socket.bytesRead - (socket._lastBytesRead || 0);
  const responseText = `size: ${size} bytes`;
  console.log(responseText);
  res.end(responseText);
  socket._lastBytesRead = socket.bytesRead;
});

server.on('clientError', function (err) {
  console.log('clientError', err);
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

server.listen(PORT, function () {
  console.log(`server started on http://127.0.0.1:${PORT}`);
});
