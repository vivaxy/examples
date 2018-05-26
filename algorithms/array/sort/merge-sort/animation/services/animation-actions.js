/**
 * @since 2018-05-20 14:56:12
 * @author vivaxy
 */

import * as EVENT_TYPES from '../../../../../_animation/enums/event-types.js';
import * as ACTION_TYPES from '../enums/action-types.js';
import Element from '../class/element.js';
import NewArray from '../class/new-array.js';

export default {
  init: (events, query) => {
    let elements = null;
    let newArrayB = null;
    let newArrayC = null;
    let elementsInB = [];
    let elementsInC = [];
    let markedArrayBIndex = null;
    let markedArrayCIndex = null;
    const body = document.body;

    events.on(EVENT_TYPES.REQUEST_ANIMATION_ACTIONS, (eventId, eventData) => {
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
    });

    events.on(EVENT_TYPES.APPLY_AN_ANIMATION_ACTION, (eventId, eventData) => {

      // console.log('animation action:', eventData.animationAction);

      if (!elements) {
        throw new Error('elements not initialized');
      }

      if (!eventData.animationAction) {
        throw new Error('missing animationAction');
      }

      const data = eventData.animationAction;

      events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_START, eventData);

      switch (data.action) {
        case ACTION_TYPES.CREATE_A_NEW_ARRAY: {
          const { arrayName, fromIndex, toIndex } = data;
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
          } else {
            throw new Error('Unexpected array name: ' + arrayName);
          }
          setTimeout(() => {
            events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
          }, query.interval);
          break;
        }
        case ACTION_TYPES.PUSH_TO_AN_ARRAY: {
          const { arrayName, index, value, elementIndex } = data;
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
          } else {
            throw new Error('Unexpected array name: ' + arrayName);
          }
          break;
        }
        case ACTION_TYPES.MARK_ARRAY_INDEX: {
          const { arrayName, index } = data;
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
          } else {
            throw new Error('Unexpected array name: ' + arrayName);
          }
          setTimeout(() => {
            events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
          }, query.interval);
          break;
        }
        case ACTION_TYPES.COMPARE: {
          const {} = data;
          elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].addCompare();
          elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].addCompare();
          setTimeout(() => {
            elementsInB[markedArrayBIndex] && elementsInB[markedArrayBIndex].removeCompare();
            elementsInC[markedArrayCIndex] && elementsInC[markedArrayCIndex].removeCompare();
            events.emit(EVENT_TYPES.ON_AN_ANIMATION_ACTION_END, eventData);
          }, query.interval);
          break;
        }
        case ACTION_TYPES.ASSIGN: {
          const { fromArrayName, index } = data;
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
          } else {
            throw new Error('Unexpected array name: ' + fromArrayName);
          }

          function switchIndex(ele) {
            if (index !== ele.index) {
              elements[ele.index] = elements[index];
              elements[index] = ele;
              elements[ele.index].index = ele.index;
              ele.index = index;
            }
          }

          break;
        }
        case ACTION_TYPES.DESTROY_NEW_ARRAYS: {
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
          break;
        }
        default:
          throw new Error('Unexpected action type: ' + data.action);
      }
    });

  },
};
