/**
 * @since 2018-05-26 10:38:31
 * @author vivaxy
 */

import * as EVENT_TYPES from '../../../../../_animation/enums/event-types.js';
import * as ACTION_TYPES from '../enums/action-types.js';
import Element from '../class/element.js';

function init(events, query) {

  let elements = [];

  let markedArrayFromIndex = null;
  let markedArrayToIndex = null;
  let pivotIndex = null;
  let loopIndex = null;

  const actionHandlers = {
    [ACTION_TYPES.MARK_ARRAY]: (eventData) => {
      ASSERT(eventData.fromIndex !== undefined, 'missing fromIndex');
      ASSERT(eventData.toIndex !== undefined, 'missing toIndex');

      removeArrayMark();

      markedArrayFromIndex = eventData.fromIndex;
      markedArrayToIndex = eventData.toIndex;

      elements.forEach((el, index) => {
        if (index >= markedArrayFromIndex && index <= markedArrayToIndex) {
          el.addArrayMark();
        }
      });

      setTimeout(() => {
        events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
      }, query.interval);
    },

    [ACTION_TYPES.MARK_PIVOT]: (eventData) => {
      ASSERT(eventData.index !== undefined, 'missing index');

      removePivotIndexMark();

      pivotIndex = eventData.index;
      elements[pivotIndex].addPivotMark();

      setTimeout(() => {
        events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
      }, query.interval);
    },

    [ACTION_TYPES.MARK_LOOP_INDEX]: (eventData) => {
      ASSERT(eventData.index !== undefined, 'missing index');

      removeLoopIndexMark();

      loopIndex = eventData.index;

      elements[loopIndex].addLoopMark();

      setTimeout(() => {
        events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
      }, query.interval);
    },

    [ACTION_TYPES.COMPARE]: (eventData) => {
      ASSERT(eventData.fromIndex !== undefined, 'missing fromIndex');
      ASSERT(eventData.toIndex !== undefined, 'missing toIndex');

      elements[eventData.fromIndex].addCompareMark();
      elements[eventData.toIndex].addCompareMark();
      setTimeout(() => {
        elements[eventData.fromIndex].removeCompareMark();
        elements[eventData.toIndex].removeCompareMark();
        events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
      }, query.interval);
    },

    [ACTION_TYPES.SWAP]: (eventData) => {
      ASSERT(eventData.fromIndex !== undefined, 'missing fromIndex');
      ASSERT(eventData.toIndex !== undefined, 'missing toIndex');

      const fromEl = elements[eventData.fromIndex];
      const toEl = elements[eventData.toIndex];

      fromEl.setIndex(eventData.toIndex);
      toEl.setIndex(eventData.fromIndex);
      elements[eventData.fromIndex] = toEl;
      elements[eventData.toIndex] = fromEl;

      ['ArrayMark', 'PivotMark', 'LoopMark', 'CompareMark'].forEach(swapMark);

      function swapMark(name) {
        const hasName = 'has' + name;
        const removeName = 'remove' + name;
        const addName = 'add' + name;
        if (fromEl[hasName]() && !toEl[hasName]()) {
          fromEl[removeName]();
          toEl[addName]();
        } else if (!fromEl[hasName]() && toEl[hasName]()) {
          fromEl[addName]();
          toEl[removeName]();
        }
      }

      setTimeout(() => {
        events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
      }, query.interval);
    },
  };

  events.on(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, requestAnimationActions);
  events.on(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, applyAnAnimationAction);
  events.on(EVENT_TYPES.ON_ANIMATION_ACTIONS_END, onAnimationActionsEnd);

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

    // console.log('animation action:', eventData.animationAction);
    ASSERT(elements, 'missing elements');
    ASSERT(eventData, 'missing eventData');

    events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_START, eventData);

    const actionType = eventData.type;
    const actionHandler = actionHandlers[actionType];
    if (!actionHandler) {
      throw new Error('Unexpected action type: ' + actionType);
    }
    actionHandler(eventData);
  }

  function onAnimationActionsEnd(eventId, eventData) {
    removeArrayMark();
    removePivotIndexMark();
    removeLoopIndexMark();
  }

  function removeArrayMark() {
    ASSERT(elements, 'missing elements');

    elements.forEach((el) => {
      el.removeArrayMark();
    });
  }

  function removePivotIndexMark() {
    ASSERT(elements, 'missing elements');

    if (pivotIndex !== null) {
      elements[pivotIndex].removePivotMark();
    }
  }

  function removeLoopIndexMark() {
    ASSERT(elements, 'missing elements');

    if (loopIndex !== null) {
      elements[loopIndex].removeLoopMark();
    }
  }

}

export default { init };
