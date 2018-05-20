/**
 * @since 2018-05-20 10:05:23
 * @author vivaxy
 */

/**
 * Ω(nlgn) <= Θ(nlgn) <= O(nlgn)
 * @param A Array
 * @param p Starting index
 * @param r Ending index
 */
module.exports = function mergeSort(A, p, r) {
  if (p >= r) {
    return;
  }
  let q = Math.floor((p + r) / 2);
  mergeSort(A, p, q);
  mergeSort(A, q + 1, r);
  merge(A, p, q, r);
};

/**
 *
 * @param A Array
 * @param p Starting index
 * @param q Section index
 * @param r Ending index
 */
function merge(A, p, q, r) {
  let B = [];
  for (let i = p; i <= q; i++) {
    B.push(A[i]);
  }
  B.push(Infinity);
  let C = [];
  for (let j = q + 1; j <= r; j++) {
    C.push(A[j]);
  }
  C.push(Infinity);
  let i = 0;
  let j = 0;
  for (let k = p; k <= r; k++) {
    if (B[i] <= C[j]) {
      A[k] = B[i];
      i++;
    } else {
      A[k] = C[j];
      j++;
    }
  }
}
