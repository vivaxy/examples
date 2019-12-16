/**
 * @since 2019-12-16 06:02
 * @author vivaxy
 */
const { Writable } = require('stream');

const writable = new Writable({
  write(chunk, encoding, callback) {
    console.log(chunk.toString(), encoding);
    callback();
  },
  // decodeStrings default to true, and encoding 'utf8' is not passed
  // Why???
  decodeStrings: false,
});

const input = 'ABCDEFG';
let i = 0;

while (i < input.length) {
  writable.write(input[i], 'utf8');
  i++;
}
