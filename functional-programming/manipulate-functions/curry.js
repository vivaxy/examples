/**
 * @since 2017-06-14 10:17:25
 * @author vivaxy
 */

/**
 * loose curry
 * @param fn
 * @param arity
 */
module.exports = function curry(fn, arity = fn.length) {
    function nextCurried(...prevArgs) {
        return function(...curArgs) {
            const args = [...prevArgs, ...curArgs];
            if (args.length >= arity) {
                return fn(...args);
            }
            return nextCurried(...args);
        };
    }

    return nextCurried();
};
