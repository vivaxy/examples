/**
 * @since 2022-07-29 21:36
 * @author vivaxy
 */
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Length': 100,
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
  });
  res.write('0');
});
server.listen(8000);
