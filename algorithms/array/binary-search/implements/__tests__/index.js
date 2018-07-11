/**
 * @since 20180417 10:44
 * @author vivaxy
 */

const test = require('ava');

const { binarySearch, recursiveBinarySearch } = require('../index.js');

const A1 = [1, 2, 3, 4, 5, 7, 8, 9];

const testCases = [
  {
    A: A1,
    n: A1.length,
    x: 2,
    answer: 1,
  },
  {
    A: A1,
    n: A1.length,
    x: 6,
    answer: -1,
  },
];

test('binary search', (t) => {
  testCases.forEach(({ A, n, x, answer }) => {
    t.deepEqual(answer, binarySearch(A, n, x));
  });
});

test('recursive binary search', (t) => {
  testCases.forEach(({ A, n, x, answer }) => {
    t.deepEqual(answer, recursiveBinarySearch(A, 0, n, x));
  });
});
