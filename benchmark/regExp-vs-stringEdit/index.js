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
  for (let i = 0; i < 10e5; i++) {
    fn();
  }
  return `${fn.name} done in ${Date.now() - startTime}ms`;
}

function regExp() {
  const str = '{{level}} === 1';
  const data = {
    level: 1,
  };
  return str.replace(/{{(.+?)}}/g, (match, p1) => {
    return data[p1];
  });
}

function stringEdit() {
  const str = '{{level}} === 1';
  const data = {
    level: 1,
  };
  let argName = '';
  let index = 0;
  let argFound = false;
  let ans = '';
  while (index < str.length) {
    const s = str[index];
    if (s === '{' && str[index + 1] === '{') {
      argFound = true;
      index += 2;
      continue;
    }
    if (s === '}' && str[index + 1] === '}') {
      argFound = false;
      ans += data[argName];
      index += 2;
      continue;
    }
    if (argFound) {
      argName += s;
      index++;
      continue;
    }
    ans += s;
    index++;
  }
  return ans;
}

log(benchmark(regExp));
log(benchmark(stringEdit));
log('String Edit is better.');
