/**
 * @since 20180711 18:27
 * @author vivaxy
 */

const test = require('ava');
const heapSort = require('../index.js');

test('heap sort', (t) => {
  t.deepEqual(heapSort([15, 8, 5, 12, 10, 1, 16, 9, 11, 7, 20, 3, 2, 6, 17, 18, 4, 13, 14, 19]), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
});
