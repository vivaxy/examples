/**
 * @since 2017-06-14 10:14:33
 * @author vivaxy
 */

module.exports = (fn) => {
    return (...args) => {
        return fn(...args.reverse());
    };
};
