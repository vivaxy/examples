/**
 * @since 2017-06-14 10:17:25
 * @author vivaxy
 */

/**
 * loose curry
 * @param fn
 * @param arity
 */
module.exports = (fn, arity = fn.length) => {
    const nextCurried = (...prevArgs) => {
        return (...curArgs) => {
            const args = [...prevArgs, ...curArgs];
            if (args.length >= arity) {
                return fn(...args);
            }
            return nextCurried(...args);
        };
    };
    return nextCurried();
};
