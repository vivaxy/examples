/**
 * @since 20180711 10:48
 * @author vivaxy
 */

const test = require('ava');
const MinHeap = require('../index.js');

test('insert', (t) => {
  const minHeap = new MinHeap();

  minHeap.add(11).add(5);

  t.is(minHeap.toString(), [5, 11].toString());

  minHeap.add(8).add(3).add(4);

  t.is(minHeap.toString(), [3, 4, 8, 11, 5].toString());

  minHeap.add(15);

  t.is(minHeap.toString(), [3, 4, 8, 11, 5, 15].toString());

  minHeap.remove(8);

  t.is(minHeap.toString(), [3, 4, 15, 11, 5].toString());

  minHeap.add(8).remove(4);

  t.is(minHeap.toString(), [3, 5, 8, 11, 15].toString());

});
