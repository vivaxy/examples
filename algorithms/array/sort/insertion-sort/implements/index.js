/**
 * @since 2018-05-06 10:14:30
 * @author vivaxy
 */

/**
 * Ω(n) <= Θ(n²) <= O(n²)
 * @param A
 * @param n
 */
module.exports = function InsertionSort(A, n) {
  for (let i = 1; i < n; i++) {
    let key = A[i];
    let j = i - 1;
    while (j >= 0 && A[j] > key) {
      A[j + 1] = A[j];
      j--;
    }
    A[j + 1] = key;
  }
};
