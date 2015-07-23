"use strict";

var f = function f(x, y, z) {
    console.log(x + y + z);
};

f.apply(undefined, [1, 2, 3]);

var array = [2, 3, 4, 5];

f.apply(undefined, array);