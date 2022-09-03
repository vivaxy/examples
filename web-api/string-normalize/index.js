/**
 * @since 2022-09-03 08:29
 * @author vivaxy
 */
const fs = require('fs');
const http = require('http');
const { URL } = require('url');

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost:8080');
  switch (url.pathname) {
    case '/index.html':
      const html = fs.readFileSync('index.html', 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
      break;
    case '/data':
      const data = url.searchParams.get('data');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ data }));
      break;
    default:
      console.log(url.href);
      res.writeHead(404);
      res.end();
  }
});
server.listen(8080);
