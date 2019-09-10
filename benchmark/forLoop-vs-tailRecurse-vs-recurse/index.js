/**
 * @since 2019-09-10 08:07:40
 * @author vivaxy
 *
 * @result
 * for loop x 6,684,412 ops/sec ±1.58% (84 runs sampled)
 * recurse x 3,551,024 ops/sec ±1.08% (92 runs sampled)
 * tail recurse x 3,681,581 ops/sec ±1.23% (90 runs sampled)
 * Fastest is for loop
 */
const array = [1, 3, 1, 4, 5, 3, 4, 5, 6, 7, 8, 4, 3, 1, 2, 4, 5, 2, 2, 3, 4];

let result = [];

function forLoop() {
  for (let i = 0; i < array.length; i++) {
    result.push(array[i] * 2);
  }
}

function tailRecurse(i = 0) {
  if (i < array.length) {
    result.push(array[i] * 2);
    recurse(i + 1);
  }
}

function recurse(i = 0) {
  if (i < array.length) {
    recurse(i + 1);
    result.push(array[i] * 2);
  }
}

const { Suite } = require('benchmark');

new Suite()
  .add('for loop', function() {
    result = [];
    forLoop();
  })
  .add('recurse', function() {
    result = [];
    recurse();
  })
  .add('tail recurse', function() {
    result = [];
    tailRecurse();
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
