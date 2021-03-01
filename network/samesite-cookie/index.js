/**
 * @since 2021-03-01 20:23
 * @author vivaxy
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const MIME = {
  '.js': 'text/javascript',
  '.html': 'text/html',
};

function getContentType(filename) {
  const ext = path.extname(filename);
  return MIME[ext];
}

function renderByFilename(filename) {
  const content = fs.readFileSync(path.join('static', filename), 'utf8');
  return {
    content,
    contentType: getContentType(filename),
  };
}

function render(req, res) {
  const { content, contentType } = renderByFilename(req.url);
  res.setHeader('Content-Type', contentType);
  return content;
}

const router = {
  '/': function (req, res) {
    const { content, contentType } = renderByFilename('index.html');
    res.setHeader('Content-Type', contentType);
    return content;
  },
  '/index.js': render,
  '/api/samesite-strict': function (req, res) {
    res.setHeader('Set-Cookie', 'Cookie-Strict=1; SameSite=Strict; Path=/');
    return '';
  },
};

const server = http.createServer(function (req, res) {
  console.log(`req: ${req.url}`);
  if (req.url in router) {
    try {
      const content = router[req.url](req, res);
      res.writeHead(200);
      res.end(content);
    } catch (e) {
      res.writeHead(500);
      res.end(e.stack);
    }
  } else {
    res.writeHead(404);
    res.end('');
  }
});

server.listen(3000, function () {
  console.log('server started on http://127.0.0.1:3000');
});
