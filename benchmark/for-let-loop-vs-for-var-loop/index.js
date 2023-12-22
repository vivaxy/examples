/**
 * @since 2023-12-22
 * @author vivaxy
 */
/**
 * for let loop will create a loopEnv and 1e5 iterationEnv
 * while for var loop has no new env
 */
function forLetLoop() {
  let sum = 0;
  for (let i = 0; i < 1e5; i++) {
    setTimeout(function () {
      sum += i;
    });
  }
}

function forVarLoop() {
  let sum = 0;
  for (var i = 0; i < 1e5; i++) {
    setTimeout(function () {
      sum += i;
    });
  }
}

/**
 * for let loop x 11.93 ops/sec ±48.86% (25 runs sampled)
 * for var loop x 16.50 ops/sec ±5.79% (22 runs sampled)
 * Fastest is for var loop,for let loop
 */
const { Suite } = require('benchmark');

new Suite()
  .add('for let loop', function () {
    forLetLoop();
  })
  .add('for var loop', function () {
    forVarLoop();
  })
  .on('cycle', function (event) {
    console.log(String(event.target));
  })
  .on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run();
