/**
 * @since 2018-04-21 18:40:33
 * @author vivaxy
 */

const test = require('ava');

const selectionSort = require('../index.js');

const expect = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

test('selection sort', async (t) => {
  const input = [5, 3, 4, 0, 6, 8, 1, 9, 2, 7];
  selectionSort(input, input.length);
  t.deepEqual(input, expect);
});
