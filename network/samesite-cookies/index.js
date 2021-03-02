/**
 * @since 2021-03-01 20:23
 * @author vivaxy
 * @description
 * - Update `SAMESITE_VALUE` to `Strict`, `Lax` to test.
 *  - Run `node ./index.js` to start website A on `http://127.0.0.1:3000/`.
 *  - Run `here` in `thrid-party` folder to start website B on `http://127.0.0.1:3001`.
 *  - Visit website A to login and logout. You'll see `Cookie: OK` when logined and `Cookie: Fail` when logouted.
 *  - Visit website B, you'll see 3 scenarios:
 *    - Website B requests website A resource as `Cross Site Resources`.
 *    - Website B navigates to website A as `Cross Site Navigation`.
 *    - Website B includes website A as `Cross Site iFrame`.
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

function getCookies(cookies = '') {
  const cookieMap = {};
  cookies.split(';').map(function (cookie) {
    const [key, value] = cookie.split('=').map(function (v) {
      return v.trim();
    });
    cookieMap[key] = value;
  });
  return cookieMap;
}

const COOKIE_NAME = 'CookieName';
const COOKIE_VALUE = 'OK';
const SAMESITE_VALUE = 'Lax';

const router = {
  '/': function (req, res) {
    const { content, contentType } = renderByFilename('index.html');
    res.setHeader('Content-Type', contentType);
    return content;
  },
  '/index.js': render,
  '/api/login': function (req, res) {
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=${COOKIE_VALUE}; SameSite=${SAMESITE_VALUE}; Path=/; HttpOnly`,
    );
    return '';
  },
  '/api/logout': function (req, res) {
    res.setHeader(
      'Set-Cookie',
      `${COOKIE_NAME}=; SameSite=${SAMESITE_VALUE}; Path=/; HttpOnly; Max-Age=0`,
    );
    return '';
  },
  '/api/get-cookie': function (req, res) {
    const cookieValue = getCookies(req.headers.cookie)[COOKIE_NAME];
    res.setHeader('Content-Type', 'image/svg+xml');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="200px" height="50px">
  <text x="0" y="20">Cookie: ${cookieValue || 'Fail'}</text>
</svg>`;
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
