/**
 * @since 2017-07-05 10:17:25
 * @author vivaxy
 */

const pipe = (...fns) => {
    return (input) => {
        return fns.reduce((value, fn) => {
            return fn(value);
        }, input);
    };
};

const addA = (value) => {
    return value + 'A';
};
const addB = (value) => {
    return value + 'B';
};
console.log(pipe(addA, addB)(''));
console.log('');
console.log('----------');
console.log('');
