/**
 * @since 2017-07-05 11:42:49
 * @author vivaxy
 */

const pipe = (...fns) => {
    return fns.reduceRight((next, fn) => {
        return (...args) => {
            fn(...args, next);
        };
    }, () => {});
};

const addA = (value, next) => {
    next(value + 'A', 'a');
};
const addB = (value1, value2, next) => {
    next(value1 + value2 + 'B');
};
const consoleLog = (value, next) => {
    console.log(value);
}
pipe(addA, addB, consoleLog)('1');
console.log('');
console.log('----------');
console.log('');
