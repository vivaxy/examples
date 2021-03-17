/**
 * @since 2021-03-15 20:25
 * @author vivaxy
 */
const path = require('path');
const execa = require('execa');
const request = require('./helpers/request.js');

let serverProcess = null;

function start({ maxHTTPHeaderSize = 8 * 1024 } = {}) {
  return new Promise(function (resolve, reject) {
    if (serverProcess) {
      reject('Server already started');
    }
    serverProcess = execa('node', [
      `--max-http-header-size=${maxHTTPHeaderSize}`,
      path.join(__dirname, '..', 'index.js'),
    ]);
    serverProcess.stdout.on('data', function (msg) {
      if (msg.toString().startsWith('server started on')) {
        resolve();
      } else {
        reject(msg.toString());
      }
    });
    serverProcess.stderr.on('data', function (msg) {
      reject(msg.toString());
    });
  });
}

function stop() {
  if (serverProcess) {
    serverProcess.cancel();
    serverProcess = null;
  }
}

afterEach(function () {
  stop();
});

test('should respond 200 when get', async function () {
  await start();
  const res = await request();
  expect(res.statusCode).toBe(200);
  expect(res.body).toBe('size: 59 bytes');
});

test('should respond 400 when get', async function () {
  await start({ maxHTTPHeaderSize: 59 });
  const res = await request({ path: '/a' });
  expect(res.statusCode).toBe(400);
});

test('should respond 200 when post', async function () {
  await start();
  const res = await request({ method: 'POST' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toBe('size: 88 bytes');
});

test('should respond 400 when post', async function () {
  await start({ maxHTTPHeaderSize: 87 });
  const res = await request({ method: 'POST' });
  expect(res.statusCode).toBe(400);
});
