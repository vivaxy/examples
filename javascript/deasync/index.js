import deasync from './deasync.js';

function testAsyncFunction() {
  return new Promise(function (resolve) {
    setTimeout(resolve, 1000);
  });
}

const deasynced = deasync(testAsyncFunction);

console.log(0);
deasynced();
console.log(1);
