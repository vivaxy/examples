"use strict";

var _ref = [1, 2, 3];
var a = _ref[0];
var b = _ref[2];

console.log(a, b);

var _c$e = { c: 4, e: 5 };
var c = _c$e.c;
var _c$e$d = _c$e.d;
var d = _c$e$d === undefined ? 7 : _c$e$d;
var _c$e$e = _c$e.e;
var e = _c$e$e === undefined ? 8 : _c$e$e;

console.log(c, d, e);

var f = function f(_ref2) {
    var x = _ref2.name;

    console.log(x);
};

f({ name: 6 });