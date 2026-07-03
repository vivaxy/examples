module.exports = function compose(...fns) {
  return function (input) {
    return fns.reduceRight(function (value, fn) {
      return fn(value);
    }, input);
  };
};

/**
 * support more agrs
 */
module.exports = function compose(...fns) {
  return fns.reduce(function (a, b) {
    return function (...args) {
      return a(b(...args));
    };
  });
};
