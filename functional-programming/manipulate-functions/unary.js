/**
 * @since 2017-06-14 10:42:45
 * @author vivaxy
 */

const unary = (fn) => {
    return (arg) => {
        return fn(arg);
    };
};
module.exports = unary;

console.log([1, 2, 3, 4].map(parseInt)); // => [1, NaN, NaN, NaN]
console.log([1, 2, 3, 4].map(unary(parseInt))); // => [1, 2, 3, 4]
console.log('');
console.log('----------');
console.log('');
