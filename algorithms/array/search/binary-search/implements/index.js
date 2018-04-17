/**
 * @since 20180417 10:42
 * @author vivaxy
 */

exports.binarySearch = (A, n, x) => {
  let p = 1;
  let r = n;
  while (p <= r) {
    let q = Math.floor((p + r) / 2);
    if (A[q] === x) {
      return q;
    }
    if (A[q] > x) {
      r = q - 1;
    } else {
      p = q + 1;
    }
  }
  return -1;
};

const recursiveBinarySearch = (A, p, r, x) => {
  if (p > r) {
    return -1;
  }
  let q = Math.floor((p + r) / 2);
  if (A[q] === x) {
    return q;
  }
  if (A[q] > x) {
    return recursiveBinarySearch(A, p, q - 1, x);
  }
  return recursiveBinarySearch(A, q + 1, p, x);
};
exports.recursiveBinarySearch = recursiveBinarySearch;
