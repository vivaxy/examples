/**
 * @since 20180918 19:22
 * @author vivaxy
 */

const test = require('ava');
const { compress, decompress } = require('../index.js');

test('lzw', (t) => {
  const inputs = [
    'TATAGATCTTAATATA',
    'abcdefghijklmnopqrstuvwxyz',
    'Ask not what your country can do for you, ask what you can do for your country.',
  ];

  inputs.forEach((input) => {
    t.is(decompress(compress(input)), input);
  });

});
