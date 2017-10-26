/**
 * @since 2017-07-05 10:17:25
 * @author vivaxy
 */

module.exports = function pipe(...fns) {
    return function(input) {
        return fns.reduce(function(value, fn) {
            return fn(value);
        }, input);
    };
};

/**
 * support more args
 */
module.exports = function(...fns) {
    return fns.reduceRight(function(a, b) {
        return function(...args) {
            return a(b(...args));
        };
    });
};
