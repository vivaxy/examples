
const pipe = require('../pipe');

const addA = (value) => {
    return value + 'A';
};
const addB = (value) => {
    return value + 'B';
};
console.log(pipe(addA, addB)('1'));     // => 1AB
