/**
 * @since 2017-07-05 11:42:49
 * @author vivaxy
 */

module.exports = (...fns) => {
    return fns.reduceRight((next, fn) => {
        return (...args) => {
            fn(...args, next);
        };
    }, () => {});
};
