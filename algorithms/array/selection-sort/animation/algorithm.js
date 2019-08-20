/**
 * @since 2018-04-22 09:29:38
 * @author vivaxy
 */
import * as actionTypes from './actionTypes.js';

export default function SelectionSort(A, n) {
  /**
   * - type: outer-select/mark/inner-select/swap
   * - index
   * @type {Array}
   */
  let steps = [];
  for (let i = 0; i < n - 1; i++) {
    steps.push({
      type: actionTypes.OUTER_SELECT,
      index: i,
    });
    let smallest = i;
    steps.push({
      type: actionTypes.MARK,
      index: smallest,
    });
    for (let j = i + 1; j < n; j++) {
      steps.push({
        type: actionTypes.INNER_SELECT,
        index: j,
      });
      steps.push({
        type: actionTypes.COMPARE,
        fromIndex: j,
        toIndex: smallest,
      });
      if (A[j] < A[smallest]) {
        smallest = j;
        steps.push({
          type: actionTypes.MARK,
          index: smallest,
        });
      }
      steps.push({
        type: actionTypes.INNER_UNSELECT,
        index: j,
      });
    }
    steps.push({
      type: actionTypes.OUTER_UNSELECT,
      index: i,
    });
    const temp = A[i];
    A[i] = A[smallest];
    A[smallest] = temp;
    steps.push({
      type: actionTypes.SWAP,
      fromIndex: i,
      toIndex: smallest,
    });
  }
  steps.push({
    type: actionTypes.MARK,
  });
  return steps;
}
