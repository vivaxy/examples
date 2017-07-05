/**
 * @since 2017-06-14 10:42:45
 * @author vivaxy
 */

module.exports = (fn) => {
    return (arg) => {
        return fn(arg);
    };
};
