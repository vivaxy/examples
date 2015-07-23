'use strict';

var f = function f(x) {
    for (var _len = arguments.length, y = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        y[_key - 1] = arguments[_key];
    }

    console.log(x * y.length, y);
};

f(3, 'hello', true);