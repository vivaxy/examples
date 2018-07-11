/**
 * @since 20180711 18:27
 * @author vivaxy
 */

const MinHeap = require('../../../heap/min-heap/implements/index.js');

module.exports = function heapSort(array) {
  const minHeap = new MinHeap();
  array.forEach((value) => {
    minHeap.add(value);
  });
  let i = 0;
  while (!minHeap.isEmpty()) {
    array[i++] = minHeap.poll();
  }
  return array;
};
