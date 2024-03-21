/**
 * @since 20180612 17:46
 * @author vivaxy
 */

const logEl = document.querySelector('log');

function log(c) {
  console.log(c);
  logEl.innerHTML += c + '\n';
}

function benchmark(fn) {
  const startTime = Date.now();
  for (let i = 0; i < 10e5; i++) {
    fn();
  }
  return `${fn.name} done in ${Date.now() - startTime}`;
}

function indexOf() {
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const lookup = 'a';

  return str.indexOf(lookup);
}

function forLoop() {
  const str = 'abcdefghijklmnopqrstuvwxyz';
  const lookup = 'a';

  let index = 0;
  let ans = -1;
  let strL = str.length;
  while (index < strL) {
    if (str[index] === lookup) {
      ans = index;
      break;
    }
    index++;
  }
  return ans;
}

log(benchmark(indexOf));
log(benchmark(forLoop));
log('String.prototype.indexOf is better than for loop');
