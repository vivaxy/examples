/**
 * @since 20180417 10:42
 * @author vivaxy
 */

exports.linearSearch = (A, n, x) => {
  let answer = -1;
  for (let i = 0; i < n; i++) {
    if (A[i] === x) {
      answer = i;
    }
  }
  return answer;
};

exports.betterLinearSearch = (A, n, x) => {
  for (let i = 0; i < n; i++) {
    if (A[i] === x) {
      return i;
    }
  }
  return -1;
};

exports.sentinelLinearSearch = (A, n, x) => {
  let last = A[n];
  A[n] = x;
  let i = 1;
  while (A[i] !== x) {
    i++;
  }
  A[n] = last;
  if (i < n || A[n] === x) {
    return i;
  }
  return -1;
};
