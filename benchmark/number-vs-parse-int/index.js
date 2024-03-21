/**
 * @since 20180612 17:15
 * @author vivaxy
 */

const logEl = document.querySelector('log');

function log(string) {
  console.log(string);
  logEl.innerHTML += string + '\n';
}

log('Running');

function benchmark(fn) {
  const startTime = Date.now();
  for (let i = 0; i < 10e6; i++) {
    fn('6234578901');
  }
  return `${fn.name} done in ${Date.now() - startTime}ms`;
}

log(benchmark(Number));
log(benchmark(parseInt));
log('Number is better.');
