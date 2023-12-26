/**
 * @since 2023-12-22
 * @author vivaxy
 */
import { run } from 'https://vivaxy.github.io/framework/utils/benchmark.js';

/**
 * for let loop will create a loopEnv and 1e5 iterationEnv
 * while for var loop has no new env
 */
function forLetLoop() {
  let sum = 0;
  for (let i = 0; i < 1e4; i++) {
    setTimeout(function () {
      sum += i;
    });
  }
}

function forVarLoop() {
  let sum = 0;
  for (var i = 0; i < 1e4; i++) {
    setTimeout(function () {
      sum += i;
    });
  }
}

console.log('running...');
setTimeout(async function () {
  console.log('for var loop', await run(forVarLoop));
  console.log('for let loop', await run(forLetLoop));
  console.log('running again...');
  setTimeout(async function () {
    console.log('for let loop', await run(forLetLoop));
    console.log('for var loop', await run(forVarLoop));
  }, 1000);
}, 1000);
