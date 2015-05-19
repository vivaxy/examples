/**
 * @since 150416 09:56
 * @author vivaxy
 */

var a = {
    name: 'a',
    age: 12
};

var b = {
    name: 'b',
    age: 13,
    sex: 'male'
};

var c = mixin(a, b);

console.log(c);
