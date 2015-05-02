// TODO fix sort not finished on screen
// var
var getQueryStringByName = function (name) {
        var result = location.search.match(new RegExp('[?&]' + name + '=([^&]+)', 'i'));
        if (result == null || result.length < 1) {
            return '';
        }
        return result[1];
    },
    interval = getQueryStringByName('interval'),
    number = getQueryStringByName('number');
if (interval === '') {
    interval = 10;
}
if (number === '') {
    number = 100;
}

// define function
var i = 0,
    steps = [], // select compare move
    quickSort = function (a, start, end) {
        i = start;
        var j = end;
        steps.push({select: [i, j]});
        while (i < j) {
            steps.push({compareTo: i});
            while (i < j && a[i] <= a[j]) {
                steps.push({compare: j});
                j--;
            }
            if (i < j) {
                steps.push({compare: j});
                steps.push({move: j});
                var temp1 = a[i];
                a[i] = a[j];
                a[j] = temp1;
            }
            steps.push({compareTo: j});
            while (i < j && a[i] < a[j]) {
                steps.push({compare: i});
                i++;
            }
            if (i < j) {
                steps.push({compare: i});
                steps.push({move: i});
                var temp2 = a[i];
                a[i] = a[j];
                a[j] = temp2;
            }
        }
        if (start < i - 1) quickSort(a, start, i - 1);
        if (end > i + 1) quickSort(a, i + 1, end);
        return a;
    },
// define array
    array = [], arrayInit = [];
for (i = 0; i < number; i++) {
    array[i] = Math.random();
    arrayInit[i] = array[i];
}
// main
quickSort(array, 0, array.length - 1);
// css
var getCssName = function (name) {
        var prefixes = ['', '-webkit-', '-ms-', '-moz-'];
        var target = document.documentElement.style;
        for (var i = 0; i < prefixes.length; i++) {
            var test = prefixes[i] + name;
            if (test in target) {
                return test;
            }
        }
        return null;
    },
    transition = getCssName('transition'),
    css = document.styleSheets[0],
    addCss = function (sheet, selectorText, cssText, position) {
        var pos = position || sheet.cssRules.length;
        if (sheet.insertRule) {
            sheet.insertRule(selectorText + '{' + cssText + '}', pos);
        } else if (sheet.addRule) {//IE
            sheet.addRule(selectorText, cssText, pos);
        }
    };
addCss(css, 'div', 'width: ' + 100 / number + '%; ' + transition + ': background ' + interval / 1000 + 's, left ' + interval / 1000 + 's;');
for (i = 0; i < number; i++) {
    addCss(css, '.div' + i, 'height: ' + 100 * arrayInit[i] + '%;');
}
// create div
var div = [];
for (i = 0; i < number; i++) {
    var d = document.createElement('div');
    d.classList.add('div' + i);
    d.style.left = 100 / number * i + '%';
    document.body.appendChild(d);
    div.push(d);
}
// animate
var toBeMoved = 0, loopVar = 0,
    loopFunc = function () {
        if (loopVar >= steps.length) {
            clearTimeout(loopVar);
            for (i = 0; i < number; i++) {
                var classList = div[i].classList;
                classList.remove('select');
                classList.remove('compare');
                classList.remove('compareTo');
            }
            return;
        }
        if (steps[loopVar].hasOwnProperty('select')) {
            for (i = 0; i < number; i++) {
                classList = div[i].classList;
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
            var temp = div[toBeMoved].style.left;
            div[toBeMoved].style.left = div[steps[loopVar].move].style.left;
            div[steps[loopVar].move].style.left = temp;
            var divTemp = div[toBeMoved];
            div[toBeMoved] = div[steps[loopVar].move];
            div[steps[loopVar].move] = divTemp;
            toBeMoved = steps[loopVar].move;
        }
        loopVar = setTimeout(loopFunc, interval);
    };
loopFunc();
