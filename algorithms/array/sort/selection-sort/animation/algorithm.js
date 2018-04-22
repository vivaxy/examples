/**
 * @since 2018-04-22 09:29:38
 * @author vivaxy
 */

export default function SelectionSort(A, n) {
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
