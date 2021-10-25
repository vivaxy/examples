/**
 * @since 2021-10-25
 * @author vivaxy
 */
const fs = require('fs');
const util = require('util');
const { createContext, getContext, hook } = require('./async-hooks');

function debug(...args) {
  fs.writeFileSync('log.log', `${util.format(...args)}\n`, { flag: 'a' });
}

let contextId = 0;
exports.log = function log(msg) {
  const context = getContext() || createContext({ id: contextId++, stack: [] });
  const currentStack = {};
  Error.captureStackTrace(currentStack);
  context.stack.unshift(...currentStack.stack.split('\n').slice(1));
  debug(context.id, msg);
};

exports.hook = hook;
