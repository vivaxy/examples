/**
 * @since 2015-11-19 15:25
 * @author vivaxy
 */
'use strict';
var add = function* (i) {
    console.log('before-yield + 1', i);
    console.log('yield        + 1', yield i + 1);
    console.log('after-yield  + 1', i);
    console.log('before-yield + 2', i);
    console.log('yield        + 2', yield i + 2);
    console.log('after-yield  + 2', i);
    console.log('before-yield + 3', i);
    console.log('yield        + 3', yield i + 3);
    console.log('after-yield  + 3', i);
};

var generator = function* (i) {
    yield* add(i);
};

var gen = add(10); // same as `generator(10)`

console.log('gen          + 1', gen.next('next + 1'));
console.log('gen          + 2', gen.next('next + 2'));
console.log('gen          + 3', gen.next('next + 3'));
console.log('gen          + 4', gen.next('next + 4'));
