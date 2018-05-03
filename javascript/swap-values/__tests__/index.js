/**
 * @since 20180503 14:02
 * @author vivaxy
 */

const test = require('ava');
const { swapValues1, swapValues2 } = require('../index.js');

test('swap values 1', (t) => {
  t.deepEqual(swapValues1([1, 10]), [10, 1]);
  t.deepEqual(swapValues1([-1, 10]), [10, -1]);
});

test('swap values 2', (t) => {
  t.deepEqual(swapValues2([1, 10]), [10, 1]);
  t.deepEqual(swapValues2([-1, 10]), [10, -1]);
});
