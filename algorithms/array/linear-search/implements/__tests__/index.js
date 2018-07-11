/**
 * @since 20180417 10:44
 * @author vivaxy
 */

const test = require('ava');

const { linearSearch, betterLinearSearch, sentinelLinearSearch } = require('../index.js');

const A1 = [9, 4, 1, 0, 5, 6, 4, 3];

const testCases = [
  {
    A: A1,
    n: A1.length,
    x: 1,
    answer: 2,
  },
  {
    A: A1,
    n: A1.length,
    x: 2,
    answer: -1,
  },
];

test('linear search', (t) => {
  testCases.forEach(({ A, n, x, answer }) => {
    t.deepEqual(answer, linearSearch(A, n, x));
  });
});

test('better linear search', (t) => {
  testCases.forEach(({ A, n, x, answer }) => {
    t.deepEqual(answer, betterLinearSearch(A, n, x));
  });
});

test('sentinel linear search', (t) => {
  testCases.forEach(({ A, n, x, answer }) => {
    t.deepEqual(answer, sentinelLinearSearch(A, n, x));
  });
});
