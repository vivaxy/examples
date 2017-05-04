/**
 * @since 2017-05-04 16:09:46
 * @author vivaxy
 * reduce 没有传第二个参数的话，会以数组第一个作为默认值，并且从第二个开始循环
 */

const compose = (...functions) => {
    return functions.reduce((acc, func) => {
        return (...args) => {
            return acc(func(...args));
        };
    }, f => f);
};

const num = compose(Math.floor, Number);

console.log(num('12.3') === 12);
