/**
 * @since 2021-10-25
 * @author vivaxy
 */
const asyncHooks = require('async_hooks');
exports.hook = asyncHooks.createHook({
  init,
  before,
  after,
  destroy,
  promiseResolve,
});

const contextMap = new Map();

exports.createContext = function createContext(data) {
  contextMap.set(asyncHooks.executionAsyncId(), data);
  return data;
};

exports.getContext = function getContext() {
  return contextMap.get(asyncHooks.executionAsyncId());
};

function init(asyncId, type, triggerAsyncId, resource) {
  // console.log('init', asyncId, type, triggerAsyncId, resource);
  if (contextMap.has(triggerAsyncId)) {
    if (contextMap.has(asyncId)) {
      throw new Error('Async id already exists');
    }
    contextMap.set(asyncId, contextMap.get(triggerAsyncId));
  }
}

function before(asyncId) {
  // console.log('before', asyncId);
}

function after(asyncId) {
  // console.log('after', asyncId);
}

function destroy(asyncId) {
  // console.log('destroy', asyncId);
  contextMap.delete(asyncId);
}

function promiseResolve(asyncId) {
  // console.log('promiseResolve', asyncId);
}
