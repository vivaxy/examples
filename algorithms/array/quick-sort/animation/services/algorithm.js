/**
 * @since 2018-05-26 10:38:37
 * @author vivaxy
 */

import * as EVENT_TYPES from '../../../../_animation/enums/event-types.js';
import * as ACTION_TYPES from '../enums/action-types.js';

function init(events) {
  events.on(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, (eventId, eventData) => {
    const { unsortedArray } = eventData;
    const actions = quickSort(unsortedArray, 0, unsortedArray.length - 1, []);

    let actionIndex = 0;
    events.on(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, () => {
      actionIndex++;
      if (actionIndex < actions.length) {
        events.emit(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, actions[actionIndex]);
      } else {
        events.emit(EVENT_TYPES.ON_ANIMATION_ACTIONS_END, actions);
      }
    });

    setTimeout(() => {
      events.emit(EVENT_TYPES.ON_ANIMATION_ACTIONS_START, actions);
      events.emit(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, actions[actionIndex]);
    }, 0);
  });
}

function quickSort(A, p, r, actions) {
  if (p >= r) {
    return;
  }
  const q = partition(A, p, r, actions);
  quickSort(A, p, q - 1, actions);
  quickSort(A, q + 1, r, actions);
  return actions;
}

function partition(A, p, r, actions) {
  actions.push({
    type: ACTION_TYPES.MARK_ARRAY,
    fromIndex: p,
    toIndex: r,
  });
  let q = p;
  actions.push({
    type: ACTION_TYPES.MARK_PIVOT,
    index: q,
  });
  for (let u = p; u < r; u++) {
    actions.push({
      type: ACTION_TYPES.MARK_LOOP_INDEX,
      index: u,
    });
    actions.push({
      type: ACTION_TYPES.COMPARE,
      fromIndex: u,
      toIndex: r,
    });
    if (A[u] <= A[r]) {
      if (q !== u) {
        const t = A[q];
        A[q] = A[u];
        A[u] = t;
        actions.push({
          type: ACTION_TYPES.SWAP,
          fromIndex: q,
          toIndex: u,
        });
      }
      q++;
      actions.push({
        type: ACTION_TYPES.MARK_PIVOT,
        index: q,
      });
    }
  }
  const t = A[r];
  A[r] = A[q];
  A[q] = t;
  actions.push({
    type: ACTION_TYPES.SWAP,
    fromIndex: q,
    toIndex: r,
  });
  return q;
}

export default { init };
