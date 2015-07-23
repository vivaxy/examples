"use strict";

var a = 0;
var b = 0;

(function () {
    var a = 1;
    var b = 1;
    if (a === 1) {
        a = 2;
        var _b = 2;
        console.log(a, _b);
    }
    console.log(a, b);
})();

console.log(a, b);