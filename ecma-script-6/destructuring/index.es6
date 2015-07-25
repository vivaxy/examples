/**
 * @since 150521 19:15
 * @author vivaxy
 */
var [a, , b] = [1, 2, 3];

console.log(a, b);

var {c, d = 7, e = 8} = {c: 4, e: 5};

console.log(c, d, e);


var f = function ({name: x}) {
    console.log(x);
};

f({name: 6});
