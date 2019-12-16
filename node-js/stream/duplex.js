/**
 * @since 2019-12-16 07:23
 * @author vivaxy
 */
const { Duplex } = require('stream');

const input = 'ABCDEFG';
let i = 0;

const duplex = new Duplex({
  read() {
    if (i < input.length) {
      this.push(input[i]);
      i++;
    }
  },
  write(chunk, encoding, callback) {
    console.log(chunk, encoding);
    callback();
  },
  decodeStrings: false,
});

duplex.on('data', function(chunk) {
  console.log(chunk.toString());
});

const input2 = 'HIJKLMN';
let j = 0;
while (j < input2.length) {
  duplex.write(input2[j], 'utf8');
  j++;
}
