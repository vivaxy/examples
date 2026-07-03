/**
 * loose curry
 * @param fn
 * @param arity
 */
module.exports = function curry(fn, arity = fn.length) {
  function nextCurried(...prevArgs) {
    return function (...curArgs) {
      const args = [...prevArgs, ...curArgs];
      if (args.length >= arity) {
        return fn(...args);
      }
      return nextCurried(...args);
    };
  }

  return nextCurried();
};
