module.exports = function reverseArgs(fn) {
  return function (...args) {
    return fn(...args.reverse());
  };
};
