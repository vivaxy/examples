var f = function (x) {var SLICE$0 = Array.prototype.slice;var y = SLICE$0.call(arguments, 1);
    console.log(x * y.length, y);
};

f(3, 'hello', true);
