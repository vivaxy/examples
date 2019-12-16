/**
 * @since 2019-12-16 07:32
 * @author vivaxy
 */
const { Transform } = require('stream');

const input = 'ABCDEFG';
let i = 0;

const transform = new Transform({
  transform(chunk, encoding, callback) {
    this.push(String.fromCharCode(chunk[0] + 32));
    callback();
  },
});

transform.on('data', function(chunk, encoding) {
  console.log(chunk.toString());
});

while (i < input.length) {
  transform.write(input[i]);
  i++;
}
