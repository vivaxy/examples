module.exports = function (fn) {
  return function (arg) {
    return fn(arg);
  };
};
