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

/**
 * support more args
 */
module.exports = (...fns) => {
    return fns.reduceRight((a, b) => {
        return (...args) => {
            return a(b(...args));
        }
    });
};
