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
    fn('123 ab cde');
  }
  return `${fn.name} done in ${Date.now() - startTime}ms`;
}

function split(input) {
  return input.split(' ');
}

function stringEdit(input) {
  let i = 0;
  let temp = '';
  let results = [];
  let il = input.length;
  while (i < il) {
    const char = input[i];
    if (char === ' ') {
      // results[results.length] = temp;
      results.push(temp);
      temp = '';
      i++;
      continue;
    }
    temp += char;
    i++;
  }
}

log(benchmark(split));
log(benchmark(stringEdit));
log('split is better.');
