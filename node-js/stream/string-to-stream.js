/**
 * @since 2019-12-16 05:30
 * @author vivaxy
 */
const { Readable } = require('stream');

function stringToStream(input) {
  return new Readable({
    read() {
      this.push(input);
      this.push(null);
    },
  });
}

const stream = stringToStream('ABCDEFG');

stream.on('data', function(chunk) {
  console.log(chunk.toString());
});
