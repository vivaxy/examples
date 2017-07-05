const unary = require('../unary');

console.log([1, 2, 3, 4].map(parseInt));            // => [1, NaN, NaN, NaN]
console.log([1, 2, 3, 4].map(unary(parseInt)));     // => [1, 2, 3, 4]
