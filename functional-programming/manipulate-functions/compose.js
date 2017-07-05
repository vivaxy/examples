/**
 * @since 2017-06-14 10:12:56
 * @author vivaxy
 */

module.exports = (...fns) => {
    return (input) => {
        return fns.reduceRight((value, fn) => {
            return fn(value);
        }, input);
    };
};
