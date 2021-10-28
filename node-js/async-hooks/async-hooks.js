/**
 * @since 2021-10-25
 * @author vivaxy
 */
const asyncHooks = require('async_hooks');
const fs = require('fs');
const util = require('util');

function debug(...args) {
  fs.writeFileSync('log.log', `${util.format(...args)}\n`, { flag: 'a' });
}

exports.debug = debug;

const hook = asyncHooks.createHook({
  init,
  before,
  after,
  destroy,
  promiseResolve,
});

hook.enable();

const contextMap = new Map();

exports.createContext = function createContext(context) {
  contextMap.set(asyncHooks.executionAsyncId(), { context });
  return context;
};

exports.getContext = function getContext(
  asyncId = asyncHooks.executionAsyncId(),
) {
  const data = contextMap.get(asyncId);
  if (data.context) {
    return data.context;
  }
  if (data.parentAsyncId) {
    return getContext(data.parentAsyncId);
  }
  return null;
};

function init(asyncId, type, triggerAsyncId) {
  contextMap.set(asyncId, { parentAsyncId: triggerAsyncId });
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
