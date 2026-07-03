var once = function (func, context) {
  var result;
  return function () {
    if (func) {
      result = func.apply(context || this, arguments);
      func = null;
    }
    return result;
  };
};
