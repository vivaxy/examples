// var
function getQueryStringByName(name, defaultValue) {
    const result = location.search.match(new RegExp('[?&]' + name + '=([^&]+)', 'i'));
    if (result === null || result.length < 1) {
        if (defaultValue !== undefined) {
            return defaultValue;
        }
        return null;
    }
    return result[1];
}

const interval = getQueryStringByName('interval', 10);
const number = getQueryStringByName('number', 100);

// define function
let i = 0;
const steps = []; // select compare move
function quickSort(a, start, end) {
    i = start;
    let j = end;
    steps.push({ select: [i, j] });
    while (i < j) {
        steps.push({ compareTo: i });
        while (i < j && a[i] <= a[j]) {
            steps.push({ compare: j });
            j--;
        }
        if (i < j) {
            steps.push({ compare: j });
            steps.push({ move: j });
            const temp1 = a[i];
            a[i] = a[j];
            a[j] = temp1;
        }
        steps.push({ compareTo: j });
        while (i < j && a[i] < a[j]) {
            steps.push({ compare: i });
            i++;
        }
        if (i < j) {
            steps.push({ compare: i });
            steps.push({ move: i });
            const temp2 = a[i];
            a[i] = a[j];
            a[j] = temp2;
        }
    }
    if (start < i - 1) quickSort(a, start, i - 1);
    if (end > i + 1) quickSort(a, i + 1, end);
    return a;
}

// define array
const array = [];
const arrayInit = [];
for (i = 0; i < number; i++) {
    array[i] = Math.random();
    arrayInit[i] = array[i];
}
// main
quickSort(array, 0, array.length - 1);

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
    addCss(css, '.div' + i, 'height: ' + 100 * arrayInit[i] + '%;');
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
let toBeMoved = 0;
let loopVar = 0;

function loopFunc() {
    if (loopVar >= steps.length) {
        clearTimeout(loopVar);
        for (i = 0; i < number; i++) {
            const classList = div[i].classList;
            classList.remove('select');
            classList.remove('compare');
            classList.remove('compareTo');
        }
        return;
    }
    if (steps[loopVar].hasOwnProperty('select')) {
        for (i = 0; i < number; i++) {
            const classList = div[i].classList;
            classList.remove('select');
            classList.remove('compare');
            classList.remove('compareTo');
        }
        for (i = steps[loopVar].select[0]; i <= steps[loopVar].select[1]; i++) {
            div[i].classList.add('select');
        }
        toBeMoved = steps[loopVar].select[0];
    }
    if (steps[loopVar].hasOwnProperty('compareTo')) {
        for (i = 0; i < number; i++) {
            div[i].classList.remove('compareTo');
        }
        div[steps[loopVar].compareTo].classList.add('compareTo');
    }
    if (steps[loopVar].hasOwnProperty('compare')) {
        for (i = 0; i < number; i++) {
            div[i].classList.remove('compare');
        }
        div[steps[loopVar].compare].classList.add('compare');
    }
    if (steps[loopVar].hasOwnProperty('move')) {
        const temp = div[toBeMoved].style.left;
        div[toBeMoved].style.left = div[steps[loopVar].move].style.left;
        div[steps[loopVar].move].style.left = temp;
        const divTemp = div[toBeMoved];
        div[toBeMoved] = div[steps[loopVar].move];
        div[steps[loopVar].move] = divTemp;
        toBeMoved = steps[loopVar].move;
    }
    loopVar++;
    setTimeout(loopFunc, interval);
}

loopFunc();
