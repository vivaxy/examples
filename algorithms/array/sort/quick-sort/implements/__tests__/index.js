/**
 * @since 2018-05-20 10:06:16
 * @author vivaxy
 */

const test = require('ava');
const quickSort = require('../index.js');

const expect = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

test('quick sort', async (t) => {
  const input = [5, 3, 4, 0, 6, 8, 1, 9, 2, 7];
  quickSort(input, 0, input.length - 1);
  t.deepEqual(input, expect);
});
