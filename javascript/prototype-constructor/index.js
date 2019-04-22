/**
 * @since 2019-04-22 10:01
 * @author vivaxy
 */

function A() {}

function B() {}

const a1 = new A();

console.log('A.prototype.constructor', A.prototype.constructor);
console.log('a1.constructor', a1.constructor);
console.log('a1 instanceof A', a1 instanceof A);

A.prototype.constructor = B;

console.log('A.prototype.constructor', A.prototype.constructor);
console.log('a1.constructor', a1.constructor);
console.log('a1 instanceof A', a1 instanceof A);

const a2 = new A();
console.log('A.prototype.constructor', A.prototype.constructor);
console.log('a2.constructor', a2.constructor);
console.log('a2 instanceof A', a2 instanceof A);
