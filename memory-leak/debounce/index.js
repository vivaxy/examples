/**
 * @since 2019-03-06 19:45
 * @author vivaxy
 */

function debounceWithClearMemory(handler, timeout) {
  let timer = null;
  return (params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handler(params);
      timer = null;
    }, timeout);
  };
}

function debounceWithoutClearMemory(handler, timeout) {
  let timer = null;
  return (params) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      handler(params);
    }, timeout);
  };
}

class TestDebounceWithClearMemory {
  constructor() {
    this.move = debounceWithClearMemory(this.move.bind(this), 10);
  }

  move() {
    return typeof this.move;
  }

  destroy() {
    this.move = null;
  }
}

class TestDebounceWithoutCleatMemory {
  constructor() {
    this.move = debounceWithoutClearMemory(this.move.bind(this), 10);
  }

  move() {
    return typeof this.move;
  }

  destroy() {
  }
}

window.testDebounceWithClearMemory = function() {

  for (let i = 0; i < 1e5; i++) {
    let a = new TestDebounceWithClearMemory();
    a.move();
    a.destroy();
    a = null;
  }

};

window.testDebounceWithoutClearMemory = function() {

  for (let i = 0; i < 1e5; i++) {
    let a = new TestDebounceWithoutCleatMemory();
    a.move();
    a.destroy();
  }

};
