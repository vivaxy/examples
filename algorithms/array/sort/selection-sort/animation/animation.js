/**
 * @since 2018-04-22 09:30:32
 * @author vivaxy
 */

import * as actionTypes from './actionTypes.js';

const stateTypes = {
  PAUSED: 0,
  ANIMATING: 1,
};

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

export default (steps, interval) => {
  let state = stateTypes.PAUSED;
  let stepIndex = 0;
  let timeout;
  let timeoutCallback;
  let stepCalled = 0;
  let markedIndex;

  const start = () => {
    if (state === stateTypes.ANIMATING) {
      return false;
    }
    state = stateTypes.ANIMATING;
    return loop();
  };

  const loop = () => {
    if (state === stateTypes.PAUSED) {
      return false;
    }
    return step(loop);
  };

  const pause = () => {
    state = stateTypes.PAUSED;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
      return true;
    }
    return false;
  };

  const step = (callback) => {
    if (stepIndex >= steps.length) {
      state = stateTypes.PAUSED;
      return false;
    }
    const { type, index, fromIndex, toIndex } = steps[stepIndex];
    stepIndex++;
    switch (type) {
      case actionTypes.OUTER_SELECT: {
        const element = document.querySelector(`[data-index="${index}"]`);
        element.classList.add('outer-select');
        addNoteToElement(element, 'select i');
        break;
      }
      case actionTypes.OUTER_UNSELECT: {
        const element = document.querySelector(`[data-index="${index}"]`);
        element.classList.remove('outer-select');
        removeNoteFromElement(element, 'select i');
        break;
      }
      case actionTypes.INNER_SELECT: {
        const element = document.querySelector(`[data-index="${index}"]`);
        element.classList.add('inner-select');
        addNoteToElement(element, 'select j');
        break;
      }
      case actionTypes.INNER_UNSELECT: {
        const element = document.querySelector(`[data-index="${index}"]`);
        element.classList.remove('inner-select');
        removeNoteFromElement(element, 'select j');
        break;
      }
      case actionTypes.MARK: {
        if (markedIndex !== undefined) {
          const prevElement = document.querySelector(`[data-index="${markedIndex}"]`);
          prevElement.classList.remove('mark');
          removeNoteFromElement(prevElement, 'smallest');
        }
        if (index !== undefined) {
          const element = document.querySelector(`[data-index="${index}"]`);
          element.classList.add('mark');
          addNoteToElement(element, 'smallest');
          markedIndex = index;
        }
        break;
      }
      case actionTypes.COMPARE: {
        const fromElement = document.querySelector(`[data-index="${fromIndex}"]`);
        const toElement = document.querySelector(`[data-index="${toIndex}"]`);
        fromElement.classList.add('compare');
        toElement.classList.add('compare');
        break;
      }
      case actionTypes.SWAP: {
        const fromElement = document.querySelector(`[data-index="${fromIndex}"]`);
        const toElement = document.querySelector(`[data-index="${toIndex}"]`);
        const fromLeft = fromElement.style.left;
        const toLeft = toElement.style.left;
        fromElement.style.left = toLeft;
        toElement.style.left = fromLeft;
        fromElement.setAttribute('data-index', toIndex);
        toElement.setAttribute('data-index', fromIndex);
        if (markedIndex === toIndex) {
          markedIndex = fromIndex;
        } else if (markedIndex === fromIndex) {
          markedIndex = toIndex;
        }
        break;
      }
      default: {
        break;
      }
    }

    timeoutCallback = () => {
      switch (type) {
        case actionTypes.OUTER_SELECT:
          break;
        case actionTypes.OUTER_UNSELECT:
          break;
        case actionTypes.INNER_SELECT:
          break;
        case actionTypes.INNER_UNSELECT:
          break;
        case actionTypes.MARK:
          break;
        case actionTypes.COMPARE: {
          const fromElement = document.querySelector(`[data-index="${fromIndex}"]`);
          const toElement = document.querySelector(`[data-index="${toIndex}"]`);
          fromElement.classList.remove('compare');
          toElement.classList.remove('compare');
          break;
        }
        default:
          break;
      }
      callback();
    };
    timeout = setTimeout(timeoutCallback, interval * 2);
    const actionType = Object.keys(actionTypes).find((actionType) => {
      return actionTypes[actionType] === type;
    });
    console.log({ actionType, index, fromIndex, toIndex });
    return true;
  };

  const restart = () => {
    stop();
    stepIndex = 0;
    start();
  };

  const stop = () => {
    pause();
    if (timeoutCallback) {
      timeoutCallback();
      timeoutCallback = null;
      return true;
    }
    return false;
  };

  const loopStep = () => {
    state = stateTypes.ANIMATING;
    if (stepCalled) {
      stepCalled--;
      step(() => {
        loopStep();
      });
    } else {
      state = stateTypes.PAUSED;

    }
  };

  const stepAction = () => {
    stepCalled++;
    loopStep();
  };

  return { start, pause, stop, restart, step: stepAction };
};
