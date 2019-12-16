/**
 * @since 2019-12-16 08:01
 * @author vivaxy
 */
function streamToString(stream) {
  return new Promise((resolve) => {
    let data = '';
    stream.on('data', function(chunk) {
      data += chunk;
    });
    stream.on('end', function() {
      resolve(data);
    });
  });
}

const { Readable } = require('stream');

const input = 'ABCDEFG';
let i = 0;

const readable = new Readable({
  read() {
    while (this.push(input[i]) && i < input.length) {
      i++;
    }
    if (i === input.length) {
      this.push(null);
    }
  },
});

streamToString(readable).then(function(data) {
  console.log(data);
});
