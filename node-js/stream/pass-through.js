/**
 * @since 2019-12-16 07:38
 * @author vivaxy
 */
const { PassThrough } = require('stream');

const passThrough = new PassThrough();
passThrough.on('data', function(chunk, encoding) {
  console.log(chunk.toString());
});

const input = 'ABCDEFG';
let i = 0;

while (i < input.length) {
  passThrough.write(input[i], 'utf8');
  i++;
}
