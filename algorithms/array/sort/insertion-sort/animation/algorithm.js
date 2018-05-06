/**
 * @since 2018-05-06 12:20:04
 * @author vivaxy
 */

import * as actionTypes from './action-types.js';

export default function InsertionSort(A, n) {
  const actions = [];

  for (let i = 1; i < n; i++) {
    actions.push({
      type: actionTypes.OUTER_SELECT,
      index: i,
    });
    let key = A[i];
    actions.push({
      type: actionTypes.MARK,
      value: key,
      index: i,
    });
    let j = i - 1;
    while (j >= 0 && A[j] > key) {
      actions.push({
        type: actionTypes.INNER_SELECT,
        index: j,
      });
      actions.push({
        type: actionTypes.COMPARE,
        index: j,
      });
      A[j + 1] = A[j];
      actions.push({
        type: actionTypes.ASSIGN,
        index: j + 1,
        value: A[j],
      });
      actions.push({
        type: actionTypes.INNER_UNSELECT,
        index: j,
      });
      j--;
    }
    if (j >= 0 && A[j] < key) {
      actions.push({
        type: actionTypes.INNER_SELECT,
        index: j,
      });
      actions.push({
        type: actionTypes.COMPARE,
        index: j,
      });
      actions.push({
        type: actionTypes.INNER_UNSELECT,
        index: j,
      });
    }
    A[j + 1] = key;
    actions.push({
      type: actionTypes.UNMARK_AND_ASSIGN,
      index: j + 1,
      value: key,
    });
    actions.push({
      type: actionTypes.OUTER_UNSELECT,
      index: i,
    });
  }
  return actions;
}
