/**
 * @since 2017-06-14 10:14:33
 * @author vivaxy
 */

const reverseArgs = (fn) => {
    return (...args) => {
        return fn(...args.reverse());
    };
};
module.exports = reverseArgs;

const minus = (base, diff) => {
    return base - diff;
};

console.log(minus(3, 2)); // => 1
console.log(reverseArgs(minus)(3, 2)); // => -1
console.log(reverseArgs(reverseArgs(minus))(3, 2)); // => 1
console.log('');
console.log('----------');
console.log('');
