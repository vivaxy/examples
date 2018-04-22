/**
 * @since 2018-04-21 18:37:34
 * @author vivaxy
 */

/**
 * Ω(n²) <= Θ(n²) <= O(n²)
 * @param A
 * @param n
 */
module.exports = function SelectionSort(A, n) {
  for (let i = 0; i < n - 1; i++) {
    let smallest = i;
    for (let j = i + 1; j < n; j++) {
      if (A[j] < A[smallest]) {
        smallest = j;
      }
    }
    const temp = A[i];
    A[i] = A[smallest];
    A[smallest] = temp;
  }
};
