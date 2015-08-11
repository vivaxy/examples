/**
 * @since 15-08-11 17:17
 * @author vivaxy
 */
var stack = new Stack();

console.log(stack.push(1));
console.log(stack.push('asd'));

console.log(stack.pop());
console.log(stack.push({a: 1}));

console.log(stack.clear());

console.log(stack.push('test'));
console.log(stack.push({b: 2}));

console.log(stack.displayAll());
