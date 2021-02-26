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
  const size = res.socket.bytesRead - (res.socket._lastBytesRead || 0);
  const responseText = `size: ${size} bytes`;
  console.log(responseText);
  res.end(responseText);
  res.socket._lastBytesRead = res.socket.bytesRead;
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
  console.log(`server started on ${PORT}`);
});
