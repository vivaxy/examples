/**
 * @since 2018-05-20 10:05:23
 * @author vivaxy
 */

/**
 * Ω(nlgn) <= Θ(nlgn) <= O(n^2)
 * @param A Array
 * @param p Starting index
 * @param r Ending index
 */
module.exports = function quickSort(A, p, r) {
  if (p >= r) {
    return;
  }
  const q = partition(A, p, r);
  quickSort(A, p, q - 1);
  quickSort(A, q + 1, r);
};

function partition(A, p, r) {
  let q = p;
  for (let u = p; u < r; u++) {
    if (A[u] <= A[r]) {
      const t = A[q];
      A[q] = A[u];
      A[u] = t;
      q++;
    }
  }
  const t = A[r];
  A[r] = A[q];
  A[q] = t;
  return q;
}
