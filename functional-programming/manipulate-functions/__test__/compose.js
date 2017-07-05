const compose = require('../compose');
const reverseArgs = require('../reverseArgs');

const addA = (value) => {
    return value + 'A';
};
const addB = (value) => {
    return value + 'B';
};
console.log(compose(addA, addB)('1'));                   // => 1BA
console.log(reverseArgs(compose)(addA, addB)('2'));      // => 2AB
