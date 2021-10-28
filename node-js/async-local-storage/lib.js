/**
 * @since 2021-10-28
 * @author vivaxy
 */
const { AsyncLocalStorage } = require('async_hooks');

const asyncLocalStorage = new AsyncLocalStorage();

exports.log = function log(msg) {
  const contextId = asyncLocalStorage.getStore();
  console.log(`${contextId || '-'}`, msg);
};

let contextId = 1;
exports.asyncLocalStorageMiddleware = async function asyncLocalStorageMiddleware(
  ctx,
  next,
) {
  asyncLocalStorage.enterWith(contextId++);
  await next();
};
