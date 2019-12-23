/**
 * @since 2019-12-23 11:45
 * @author vivaxy
 *
 * @result
 * bit operations x 115,591,266 ops/sec ±0.48% (90 runs sampled)
 * math operations x 110,635,059 ops/sec ±0.51% (86 runs sampled)
 * Fastest is bit operations
 */
const operations = [4, 9, 2];

let resultA = null;
let resultB = null;

const { Suite } = require('benchmark');

new Suite()
  .add('bit operations', function() {
    let a = 0;
    operations.forEach(function(op) {
      a |= op;
    });
    resultA = a;
  })
  .add('math operations', function() {
    let b = 0;
    operations.forEach(function(op) {
      b += op;
    });
    resultB = b;
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    if (resultA !== resultB) {
      throw new Error('Result not matched: ' + resultA + ', ' + resultB);
    }
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
