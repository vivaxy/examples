/**
 * @since 2017-07-05 10:17:25
 * @author vivaxy
 */

module.exports = (...fns) => {
    return (input) => {
        return fns.reduce((value, fn) => {
            return fn(value);
        }, input);
    };
};
