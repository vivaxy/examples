/**
 * @since 2018-05-06 12:45:26
 * @author vivaxy
 */

import * as stateTypes from './state-types.js';
import StateMachine from './state-machine.js';
import events from './events.js';
import * as eventTypes from './event-types.js';
import * as actionTypes from './action-types.js';
import query from './query.js';

const stateMachine = new StateMachine('sort', events);

stateMachine.switchState(stateTypes.READY);

function selectElement(index) {
  return document.querySelector(`[data-index="${index}"]`);
}

let outerSelectIndex = null;
let innerSelectIndex = null;
let markElement = null;

const addNoteToElement = (element, note) => {
  const content = element.innerHTML;
  if (content.includes(note)) {
    return false;
  }
  element.innerHTML = content + '\n' + note;
  return true;
};

const removeNoteFromElement = (element, note) => {
  const content = element.innerHTML;
  if (!content.includes(note)) {
    return false;
  }
  element.innerHTML = content.split('\n').filter((n) => {
    return n !== note;
  }).join('\n');
};

const actionHandlers = {
  [actionTypes.OUTER_SELECT]: {
    enter: ({ type, index }, cb) => {
      outerSelectIndex = index;
      const ele = selectElement(index);
      ele.classList.add(type);
      addNoteToElement(ele, 'outer select');
      cb();
    },
    out: ({}, cb) => {
      cb();
    },
  },
  [actionTypes.OUTER_UNSELECT]: {
    enter: ({}, cb) => {
      const ele = selectElement(outerSelectIndex);
      ele.classList.remove(actionTypes.OUTER_SELECT);
      removeNoteFromElement(ele, 'outer select');
      outerSelectIndex = null;
      cb();
    },
    out: ({}, cb) => {
      cb();
    },
  },
  [actionTypes.MARK]: {
    enter: ({ type, value, index }, cb) => {
      markElement = selectElement(index);
      markElement.style.top = (100 - (value * 100)) + '%';
      markElement.style.bottom = 'unset';
      addNoteToElement(markElement, 'mark');
      setTimeout(() => {
        markElement.classList.add(type);
        markElement.style.top = '0';
        cb();
      }, 0);
    },
    out: ({}, cb) => {
      cb();
    },
  },
  [actionTypes.UNMARK_AND_ASSIGN]: {
    enter: ({ index, value }, cb) => {
      markElement.style.top = '';
      markElement.style.bottom = (100 - (value * 100)) + '%';
      markElement.setAttribute('data-value', String(value));
      removeNoteFromElement(markElement, 'mark');
      setTimeout(() => {
        markElement.style.left = (100 / query.length * index) + '%';
        setTimeout(() => {
          markElement.style.bottom = '';
          setTimeout(() => {
            cb();
          }, query.interval);
        }, query.interval);
      }, 0);
    },
    out: ({}, cb) => {
      markElement.style.transition = `all ${query.interval}ms`;
      markElement = null;
      cb();
    },
  },
  [actionTypes.INNER_SELECT]: {
    enter: ({ type, index }, cb) => {
      innerSelectIndex = index;
      const ele = selectElement(index);
      ele.classList.add(type);
      addNoteToElement(ele, 'inner select');
      cb();
    },
    out: ({ type, index, fromIndex, toIndex, value }, cb) => {
      cb();
    },
  },
  [actionTypes.INNER_UNSELECT]: {
    enter: ({}, cb) => {
      const ele = selectElement(innerSelectIndex);
      ele.classList.remove(actionTypes.INNER_SELECT);
      removeNoteFromElement(ele, 'inner select');
      innerSelectIndex = null;
      cb();
    },
    out: ({}, cb) => {
      cb();
    },
  },
  [actionTypes.COMPARE]: {
    enter: ({ type, index }, cb) => {
      const ele = selectElement(index);
      ele.classList.add(type);
      markElement.classList.add(type);
      addNoteToElement(ele, 'compare');
      addNoteToElement(markElement, 'compare');
      cb();
    },
    out: ({ type, index }, cb) => {
      const ele = selectElement(index);
      ele.classList.remove(type);
      markElement.classList.remove(type);
      removeNoteFromElement(ele, 'compare');
      removeNoteFromElement(markElement, 'compare');
      cb();
    },
  },
  [actionTypes.ASSIGN]: {
    enter: ({ type, index }, cb) => {
      const ele = selectElement(index - 1);
      ele.style.left = (100 / query.length * index) + '%';
      ele.setAttribute('data-index', String(index));
      addNoteToElement(ele, 'assign');
      markElement.setAttribute('data-index', String(index - 1));
      if (outerSelectIndex === index) {
        outerSelectIndex = index - 1;
      } else if (outerSelectIndex === index - 1) {
        outerSelectIndex = index;
      }
      if (innerSelectIndex === index) {
        innerSelectIndex = index - 1;
      } else if (innerSelectIndex === index - 1) {
        innerSelectIndex = index;
      }
      cb();
    },
    out: ({ type, index }, cb) => {
      const ele = selectElement(index);
      removeNoteFromElement(ele, 'assign');
      cb();
    },
  },
};

let animationTimeout = null;

events.on(eventTypes.APPLY_NEXT_ACTION, (eventId, eventData) => {
  actionHandlers[eventData.action.type].enter(eventData.action, () => {
    animationTimeout = setTimeout(() => {
      actionHandlers[eventData.action.type].out(eventData.action, () => {
        events.emit(eventTypes.ON_AN_ACTION_END, eventData);
        animationTimeout = null;
      });
    }, query.interval);
  });
});

events.on(eventTypes.ON_ACTION_DRAIN, () => {
  stateMachine.switchState(stateTypes.FINISHED);
});

export const start = () => {
  stateMachine.switchState(stateTypes.PLAYING);
};
