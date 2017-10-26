/**
 * @since 2017-07-05 11:42:49
 * @author vivaxy
 */

module.exports = function asyncPipe(...fns) {
    return fns.reduceRight(function(next, fn) {
        return function(...args) {
            fn(...args, next);
        };
    }, function() {
    });
};
