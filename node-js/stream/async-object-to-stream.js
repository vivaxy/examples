/**
 * @since 2019-12-16 07:49
 * @author vivaxy
 */
const { Readable } = require('stream');

function asyncObjectToStream(fn, keys) {
  const p = fn();
  const ret = {};
  keys.forEach(function(key) {
    ret[key] = new Readable({
      read() {
        p.then((data) => {
          this.push(String(data[key]));
          this.push(null);
        });
      },
    });
  });
  return ret;
}

function getData() {
  return new Promise((resolve) => {
    setTimeout(function() {
      resolve({
        name: 'ABCDEFG',
        age: 18,
      });
    }, 1000);
  });
}

const objectStream = asyncObjectToStream(getData, ['name', 'age']);
setTimeout(function() {
  Object.keys(objectStream).forEach(function(key) {
    const timeKey = 'getData for ' + key;
    console.time(timeKey);
    objectStream[key].on('data', function(chunk) {
      console.log(chunk.toString());
      console.timeEnd(timeKey);
    });
  });
}, 500);
