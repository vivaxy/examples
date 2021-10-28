/**
 * @since 2021-10-25
 * @author vivaxy
 */
const { createContext, getContext, debug } = require('./async-hooks');

exports.log = function log(msg) {
  const context = getContext();
  const currentStack = {};
  Error.captureStackTrace(currentStack);
  context.stack.unshift(...currentStack.stack.split('\n').slice(1));
  console.log(context.id, msg);
};

let contextId = 0;
exports.middleware = async function (ctx, next) {
  createContext({ id: contextId++, stack: [] });
  await next();
};
