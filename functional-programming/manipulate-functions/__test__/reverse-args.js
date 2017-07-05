const reverseArgs = require('../reverse-args');

const minus = (base, diff) => {
    return base - diff;
};

console.log(minus(3, 2));                               // => 1
console.log(reverseArgs(minus)(3, 2));                  // => -1
console.log(reverseArgs(reverseArgs(minus))(3, 2));     // => 1
