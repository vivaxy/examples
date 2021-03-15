/**
 * @since 2021-02-18 15:23
 * @author vivaxy
 * 2 ways of getting request header size
 * 1. bytesRead - previousBytesRead
 * 2. byteLength(socket.data)
 *
 * use `node --max-http-header-size=100 ./index.js` to test (only on node.js v10 or above)
 */
const http = require('http');
const { Buffer } = require('buffer');

const PORT = 3000;

function getBodyLength(req) {
  return new Promise(function (resolve, reject) {
    let bodyLength = 0;
    req.on('data', function (chunk) {
      bodyLength += Buffer.byteLength(chunk);
    });
    req.on('end', function () {
      resolve(bodyLength);
      req.off('error', reject);
    });
    req.on('error', function (e) {
      reject(e);
    });
  });
}

const server = http.createServer(async function (req, res) {
  const { socket } = req;
  const lastBytesRead = socket._lastBytesRead || 0;
  const currentBytesRead = socket.bytesRead;
  // const bodyLength = Number(req.headers['content-length']) || 0;
  // not working when transfer-encoding: 'chunked'
  const bodyLength = await getBodyLength(req);
  const size = currentBytesRead - lastBytesRead - bodyLength;
  const responseText = `size: ${size} bytes`;
  console.log(responseText);
  res.end(responseText);
  socket._lastBytesRead = currentBytesRead;
});

// if clientError is attached, it will override the original handler
server.on('clientError', function (err, socket) {
  console.log('clientError', err);
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
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

module.exports = {
  start() {
    return new Promise(function (resolve, reject) {
      server.on('error', reject);
      server.listen(PORT, function () {
        console.log(`server started on http://127.0.0.1:${PORT}`);
        resolve();
        server.off('error', reject);
      });
    });
  },
  close() {
    return new Promise(function (resolve, reject) {
      server.on('error', reject);
      server.close(function () {
        resolve();
        server.off('error', reject);
      });
    });
  },
};
