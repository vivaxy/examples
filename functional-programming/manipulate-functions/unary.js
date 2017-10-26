/**
 * @since 2017-06-14 10:42:45
 * @author vivaxy
 */

module.exports = function(fn) {
    return function(arg) {
        return fn(arg);
    };
};
