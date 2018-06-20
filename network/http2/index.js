/**
 * @since 20180620 19:22
 * @author vivaxy
 */

const { Writable } = require('stream');
const http2 = require('http2');
const {
  HTTP2_HEADER_METHOD,
  HTTP2_HEADER_PATH,
  HTTP2_HEADER_STATUS,
  HTTP2_HEADER_CONTENT_TYPE,
} = http2.constants;
const pem = require('pem');

const writable = new Writable();
writable._write = (chunk, encoding, callback) => {
  console.log('chunk', chunk);
};

pem.createCertificate({ days: 1, selfSigned: true }, (err, keys) => {
  if (err) {
    console.log(err);
  }
  const server = http2.createSecureServer({
    key: keys.serviceKey,
    cert: keys.certificate,
  });
  server.on('error', (err) => console.error(err));

  server.on('stream', (stream, headers) => {
    stream.pipe(writable);
    // console.log('stream', stream);
    // stream is a Duplex
    stream.respond({
      [HTTP2_HEADER_CONTENT_TYPE]: 'text/html',
      [HTTP2_HEADER_STATUS]: 200,
    });
    stream.end('<h1>Hello World</h1>');
  });

  server.listen(8443);

});
