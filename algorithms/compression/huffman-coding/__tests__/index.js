/**
 * @since 20180918 13:41
 * @author vivaxy
 */

const test = require('ava');
const { compress, decompress } = require('../index.js');

test('build huffman tree', (t) => {
  const inputs = [
    'TAATTAGAAATTCTATTATA',
    'abcdefghijklmnopqrstuvwxyz',
  ];

  inputs.forEach((input) => {
    const { compressed, huffmanTree } = compress(input);
    t.is(decompress(compressed, huffmanTree), input);
  });

});
