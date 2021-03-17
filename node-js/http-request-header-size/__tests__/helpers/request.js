/**
 * @since 2021-03-15 20:28
 * @author vivaxy
 */
const http = require('http');
const { Buffer } = require('buffer');

module.exports = function request({
  method = 'GET',
  path = '/',
  postData = '',
  headers = {},
} = {}) {
  return new Promise(function (resolve, reject) {
    const req = http.request(
      {
        port: 3000,
        method,
        path,
        headers,
      },
      function (res) {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          body += chunk;
        });
        res.on('end', function () {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body,
          });
        });
      },
    );

    req.on('error', reject);

    if (method === 'POST') {
      req.write(postData);
    }
    req.end();
  });
};
