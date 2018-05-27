// var
function getQueryStringByName(name, defaultValue) {
  const result = location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
  if (result === null || result.length < 1) {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    return null;
  }
  return result[1];
}

const interval = getQueryStringByName('interval', 300);
const number = getQueryStringByName('number', 30);
// main
const array = [];
const step = [];
let stepN = 0;
const a = [];
let i;
for (i = 0; i < number; i++) {
  array[i] = Math.random();
  a[i] = array[i];
}

function putArrayInStep(c, m) {
  step[stepN] = {
    compare: c,
    move: m,
  };
  stepN++;
}

for (i = 0; i < a.length - 1; i++) {
  for (let j = 0; j < a.length - 1 - i; j++) {
    if (a[j] > a[j + 1]) {
      const t = a[j];
      a[j] = a[j + 1];
      a[j + 1] = t;
      putArrayInStep(j, 1);
    } else {
      putArrayInStep(j, 0);
    }
  }
}

// css
function getCssName(name) {
  const prefixes = ['', '-webkit-', '-ms-', '-moz-'];
  const target = document.documentElement.style;
  for (let i = 0; i < prefixes.length; i++) {
    const test = prefixes[i] + name;
    if (test in target) {
      return test;
    }
  }
  return null;
}

const transition = getCssName('transition');
const css = document.styleSheets[0];

function addCss(sheet, selectorText, cssText, position) {
  const pos = position || sheet.cssRules.length;
  if (sheet.insertRule) {
    sheet.insertRule(selectorText + '{' + cssText + '}', pos);
  } else if (sheet.addRule) { // IE
    sheet.addRule(selectorText, cssText, pos);
  }
}

addCss(css, 'div', 'width: ' + 100 / number + '%; ' + transition + ': background ' + interval / 1000 + 's, left ' + interval / 1000 + 's;');
for (i = 0; i < number; i++) {
  addCss(css, '.div' + i, 'height: ' + 100 * array[i] + '%;');
}
// create div
const div = [];
for (i = 0; i < number; i++) {
  const d = document.createElement('div');
  d.classList.add('div' + i);
  d.style.left = 100 / number * i + '%';
  document.body.appendChild(d);
  div.push(d);
}
// animate
let stepI = -1;

function compare() {
  if (stepI >= 0) {
    div[step[stepI].compare].classList.remove('compare');
    div[step[stepI].compare + 1].classList.remove('compare');
  }
  stepI++;
  if (stepI >= stepN) {
    clearTimeout(loop1);
    clearTimeout(loop2);
    return;
  }
  div[step[stepI].compare].classList.add('compare');
  div[step[stepI].compare + 1].classList.add('compare');
  loop2 = setTimeout(move, interval);
}

function move() {
  if (step[stepI].move === 1) {
    const t = div[step[stepI].compare].style.left;
    div[step[stepI].compare].style.left = div[step[stepI].compare + 1].style.left;
    div[step[stepI].compare + 1].style.left = t;
    const divT = div[step[stepI].compare];
    div[step[stepI].compare] = div[step[stepI].compare + 1];
    div[step[stepI].compare + 1] = divT;
  }
  loop1 = setTimeout(compare, interval);
}

let loop2 = 0;
let loop1 = setTimeout(compare, interval);
