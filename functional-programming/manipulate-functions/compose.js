/**
 * @since 2017-06-14 10:12:56
 * @author vivaxy
 */

const reverseArgs = require('./reverseArgs');

const compose1 = (...fns) => {
    const traverse = (funcs, result) => {
        if (!funcs.length) {
            return result;
        }
        const nextFuncs = [...funcs];
        const currentFunc = nextFuncs.pop();
        return traverse(nextFuncs, currentFunc(result));
    };
    return (input) => {
        return traverse(fns, input);
    };
};

const compose = (...fns) => {
    return (input) => {
        return fns.reduceRight((value, fn) => {
            return fn(value);
        }, input);
    };
};

module.exports = compose;

const addA = (value) => {
    return value + 'A';
};
const addB = (value) => {
    return value + 'B';
};
console.log(compose(addA, addB)(''));
console.log(reverseArgs(compose)(addA, addB)(''));
console.log('');
console.log('----------');
console.log('');
