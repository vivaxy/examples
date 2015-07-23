"use strict";

var f = function f(a) {
    var b = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

    console.log(a + b);
};

f(1);