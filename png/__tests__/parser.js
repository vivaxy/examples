/**
 * @since 20180419 10:47
 * @author vivaxy
 */

const test = require('ava');
const { PNG } = require('pngjs3');

const parser = require('../parser.js');


test('parser', async(t) => {
  [
    require('./fixtures/buffer1.js'),
    require('./fixtures/buffer2.js'),
    require('./fixtures/buffer3.js'),
  ].forEach((buffer) => {
    const result = parser(buffer);
    console.log(result);
    t.deepEqual(PNG.sync.read(buffer), result);
  });
});
