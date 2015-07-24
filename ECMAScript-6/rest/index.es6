/**
 * @since 150521 19:15
 * @author vivaxy
 */
var f = function (x, ...y) {
    console.log(x * y.length, y);
};

f(3, 'hello', true);
