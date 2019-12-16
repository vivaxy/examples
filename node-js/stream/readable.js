/**
 * @since 2019-12-16 05:42
 * @author vivaxy
 */
const { Readable } = require('stream');

const input = 'ABCDEFG';
let i = 0;

const readable = new Readable({
  read() {
    while (this.push(input[i]) && i < input.length) {
      i++;
    }
  },
});

readable.on('data', function(chunk) {
  console.log(chunk.toString());
});
