/**
 * @since 150521 19:15
 * @author vivaxy
 */
var f = function (x, y, z) {
    console.log(x + y + z);
};

f(...[1, 2, 3]);

var array = [2, 3, 4, 5];

f(...array);
