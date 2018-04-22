/**
 * @since 2018-04-22 09:30:32
 * @author vivaxy
 */

const stateTypes = {
  PAUSED: 0,
  ANIMATING: 1,
};

export default (_steps) => {
  let state = stateTypes.PAUSED;
  let steps = _steps.slice();
  let timeout;
  let timeoutCallback;
  let stepCalled = 0;

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
    if (steps.length === 0) {
      state = stateTypes.PAUSED;
      return false;
    }
    const { interval, element, action } = steps.shift();
    element.classList.add(action);
    element.style.transition = interval + 'ms';
    timeoutCallback = () => {
      element.style.transition = '';
      element.classList.remove(action);
      callback();
    };
    timeout = setTimeout(timeoutCallback, interval);
    return true;
  };

  const restart = () => {
    stop();
    steps = _steps.slice();
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
    step(() => {
      if (stepCalled) {
        stepCalled--;
        loopStep();
      } else {
        state = stateTypes.PAUSED;
      }
    });
  };

  const stepAction = () => {
    stepCalled++;
    loopStep();
  };

  return { start, pause, stop, restart, step: stepAction };
};
