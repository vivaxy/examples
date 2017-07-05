const asyncPipe = require('../async-pipe');

const addA = (value, next) => {
    next(value + 'A', 'a');
};
const addB = (value, anotherValue, next) => {
    console.log(anotherValue);                      // => a
    next(value + 'B');
};
const consoleLog = (value, next) => {
    console.log(value);
};
asyncPipe(addA, addB, consoleLog)('1');              // => 1AB
