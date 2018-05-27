/**
 * @since 2018-05-20 14:56:12
 * @author vivaxy
 */

import * as EVENT_TYPES from '../../../../../_animation/enums/event-types.js';
import * as ACTION_TYPES from '../enums/action-types.js';
import Element from '../class/element.js';
import NewArray from '../class/new-array.js';

function init(events, query) {
  let elements = null;
  let newArrayB = null;
  let newArrayC = null;
  let elementsInB = [];
  let elementsInC = [];
  let markedArrayBIndex = null;
  let markedArrayCIndex = null;
  const body = document.body;

  const actionHandlers = {
    [ACTION_TYPES.CREATE_A_NEW_ARRAY]: createAnArray,
    [ACTION_TYPES.PUSH_TO_AN_ARRAY]: pushToAnArray,
    [ACTION_TYPES.MARK_ARRAY_INDEX]: markArrayIndex,
    [ACTION_TYPES.COMPARE]: compare,
    [ACTION_TYPES.ASSIGN]: assign,
    [ACTION_TYPES.DESTROY_NEW_ARRAYS]: destroyNewArrays,
  };

  events.on(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, requestAnimationActions);
  events.on(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, applyAnAnimationAction);

  function requestAnimationActions(eventId, eventData) {
    const body = document.body;
    elements = eventData.unsortedArray.map((value, index) => {
      return new Element({
        index,
        value,
        parent: body,
        width: 100 / eventData.unsortedArray.length,
        animationDuration: query.interval,
      });
    });
  }

  function applyAnAnimationAction(eventId, eventData) {

    ASSERT(elements, 'missing elements');
    ASSERT(eventData, 'missing eventData');

    events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_START, eventData);

    const actionType = eventData.type;
    const actionHandler = actionHandlers[actionType];
    ASSERT(actionHandler, 'Unexpected action type: ' + actionType);
    actionHandler(eventData);
  }

  function createAnArray(eventData) {
    const { arrayName, fromIndex, toIndex } = eventData;

    ASSERT(arrayName === 'B' || arrayName === 'C', 'Unexpected array name: ' + arrayName);

    if (arrayName === 'B') {
      newArrayB = new NewArray({
        arrayLength: elements.length,
        fromIndex,
        toIndex,
        parent: body,
        arrayName,
        animationDuration: query.interval,
      });
    } else if (arrayName === 'C') {
      newArrayC = new NewArray({
        arrayLength: elements.length,
        fromIndex,
        toIndex,
        parent: body,
        arrayName,
        animationDuration: query.interval,
      });
    }
    setTimeout(() => {
      events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
    }, query.interval);
  }

  function pushToAnArray(eventData) {
    const { arrayName, index, value, elementIndex } = eventData;

    ASSERT(arrayName === 'B' || arrayName === 'C', 'Unexpected array name: ' + arrayName);

    if (arrayName === 'B') {
      let element = elements[elementIndex];
      element.moveToNewArray({ toArray: newArrayB, arrayName, index, value }, () => {
        setTimeout(() => {
          events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
        }, query.interval);
      });
      elementsInB.push(element);
    } else if (arrayName === 'C') {
      const element = elements[elementIndex];
      element.moveToNewArray({ toArray: newArrayC, arrayName, index, value }, () => {
        setTimeout(() => {
          events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
        }, query.interval);
      });
      elementsInC.push(element);
    }
  }

  function markArrayIndex(eventData) {
    const { arrayName, index } = eventData;

    ASSERT(arrayName === 'B' || arrayName === 'C', 'Unexpected array name: ' + arrayName);

    if (arrayName === 'B') {
      if (markedArrayBIndex !== null) {
        elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].removeMark();
      }
      markedArrayBIndex = index;
      elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].addMark();
    } else if (arrayName === 'C') {
      if (markedArrayCIndex !== null) {
        elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].removeMark();
      }
      markedArrayCIndex = index;
      elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].addMark();
    }
    setTimeout(() => {
      events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
    }, query.interval);
  }

  function compare(eventData) {
    elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].addCompare();
    elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].addCompare();
    setTimeout(() => {
      elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].removeCompare();
      elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].removeCompare();
      events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
    }, query.interval);
  }

  function assign(eventData) {
    const { fromArrayName, index } = eventData;

    ASSERT(fromArrayName === 'B' || fromArrayName === 'C', 'Unexpected array name: ' + fromArrayName);

    if (fromArrayName === 'B') {
      const ele = elementsInB[markedArrayBIndex];
      ele.moveBack({ index }, () => {
        setTimeout(() => {
          events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
        }, query.interval);
      });
      switchIndex(ele);
    } else if (fromArrayName === 'C') {
      const ele = elementsInC[markedArrayCIndex];
      ele.moveBack({ index }, () => {
        setTimeout(() => {
          events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
        }, query.interval);
      });
      switchIndex(ele);
    }

    function switchIndex(ele) {
      if (index !== ele.index) {
        elements[ele.index] = elements[index];
        elements[index] = ele;
        elements[ele.index].index = ele.index;
        ele.index = index;
      }
    }
  }

  function destroyNewArrays(eventData) {
    if (newArrayB) {
      newArrayB.hide();
    }
    if (newArrayC) {
      newArrayC.hide();
    }
    setTimeout(() => {
      if (newArrayB) {
        newArrayB.dispose();
        newArrayB = null;
        elementsInB = [];
      }
      if (newArrayC) {
        newArrayC.dispose();
        newArrayC = null;
        elementsInC = [];
      }
      events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
    }, query.interval);
  }
}

export default { init };
