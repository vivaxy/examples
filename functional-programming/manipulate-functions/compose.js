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

module.exports = (...fns) => {
    return fns.reduce((a, b) => {
        return (...args) => {
            return a(b(...args));
        };
    });
};
