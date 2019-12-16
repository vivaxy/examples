/**
 * @since 2019-12-16 07:49
 * @author vivaxy
 */
const { Readable } = require('stream');

function asyncToStream(fn) {
  const p = fn();
  return new Readable({
    read() {
      p.then((chunk) => {
        this.push(chunk);
        this.push(null);
      });
    },
  });
}

function getData() {
  return new Promise((resolve) => {
    setTimeout(function() {
      resolve('ABCDEFG');
    }, 1000);
  });
}

const stream = asyncToStream(getData);
setTimeout(function() {
  console.time('getData');
  stream.on('data', function(chunk) {
    console.log(chunk.toString());
    console.timeEnd('getData');
  });
}, 500);
