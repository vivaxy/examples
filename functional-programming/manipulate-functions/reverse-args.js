/**
 * @since 2017-06-14 10:14:33
 * @author vivaxy
 */

module.exports = function reverseArgs(fn) {
    return function(...args) {
        return fn(...args.reverse());
    };
};
