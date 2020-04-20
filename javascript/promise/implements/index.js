/**
 * @since 2020-04-20 04:52
 * @author vivaxy
 */
const STATUS = {
  PENDING: 0,
  RESOLVED: 1,
  REJECTED: 2,
};

function createMicroTaskCallback(fn) {
  let iterations = 0;
  let mo = new MutationObserver(function() {
    fn();
  });
  let node = document.createTextNode('');
  mo.observe(node, { characterData: true });
  return {
    run() {
      node.data = iterations = ++iterations % 2;
    },
    destroy() {
      mo.disconnect();
      mo = null;
      iterations = null;
      node = null;
    },
  };
}

class XPromise {
  static resolve(value) {
    return new XPromise(function(resolve) {
      resolve(value);
    });
  }

  constructor(runner) {
    this.status = STATUS.PENDING;
    this.value = null;
    this.resolves = [];
    this.rejects = [];

    const flushResolves = () => {
      while (this.resolves.length) {
        if (this.value instanceof XPromise) {
          this.value.then(this.resolves.shift());
        }
        this.value = this.resolves.shift()(this.value);
      }
    };

    const flushRejects = () => {
      while (this.rejects.length) {
        if (this.value instanceof XPromise) {
          this.value.catch(this.rejects.shift());
        }
        this.value = this.rejects.shift()(this.value);
      }
    };

    this.microTasks = createMicroTaskCallback(() => {
      if (this.status === STATUS.PENDING) {
        // nothing
        return;
      }
      if (this.status === STATUS.RESOLVED) {
        flushResolves();
        return;
      }
      if (this.status === STATUS.REJECTED) {
        flushRejects();
        return;
      }
    });

    const microTasks = createMicroTaskCallback(() => {
      microTasks.destroy();
      runner(
        (resolved) => {
          this.status = STATUS.RESOLVED;
          this.value = resolved;
          flushResolves();
        },
        (rejected) => {
          this.status = STATUS.REJECTED;
          this.value = rejected;
          flushRejects();
        },
      );
    });
    microTasks.run();
  }

  then(callback) {
    this.resolves.push(callback);
    this.microTasks.run();
    return this;
  }

  catch(callback) {
    this.rejects.push(callback);
    this.microTasks.run();
    return this;
  }
}

window.Promise = XPromise;

const p = new Promise(function(resolve) {
  setTimeout(function() {
    resolve(1);
  }, 1);
})
  .then(function(value) {
    console.log(value === 1);
    return value;
  })
  .then(function() {
    return Promise.resolve(2);
  });

setTimeout(function() {
  p.then(function(value) {
    console.log(value === 2);
  });
}, 10);
