/**
 * @since 2017-06-14 10:17:25
 * @author vivaxy
 */

/**
 * loose curry
 * @param fn
 * @param arity
 */
const curry = (fn, arity = fn.length) => {
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
module.exports = curry;

const minus = (base, diff) => {
    return base - diff;
};

const minusFrom3 = curry(minus)(3);
console.log(minusFrom3(2)); // => 1

const appendString = (a, b, c, d) => {
    return `a(${a}) + b(${b}) + c(${c}) + d(${d})`;
};

const appendStringCurried = curry(appendString);
console.log(appendStringCurried('A', 'B', 'C', 'D')); // => 'a(A) + b(B) + c(C) + d(D)'
console.log(appendStringCurried('A', 'B', 'C')('D')); // => 'a(A) + b(B) + c(C) + d(D)'
console.log(appendStringCurried('A')('B')('C')('D')); // => 'a(A) + b(B) + c(C) + d(D)'
console.log(appendStringCurried()('A')()('B')()('C')()('D')); // => 'a(A) + b(B) + c(C) + d(D)'
console.log(appendStringCurried()()()()('A', 'B', 'C', 'D')); // => 'a(A) + b(B) + c(C) + d(D)'
console.log('');
console.log('----------');
console.log('');
