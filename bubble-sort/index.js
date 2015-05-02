// var
var getQueryStringByName = function (name) {
        var result = location.search.match(new RegExp('[\?\&]' + name + '=([^\&]+)', 'i'));
        if (result == null || result.length < 1) {
            return '';
        }
        return result[1];
    },
    interval = getQueryStringByName('interval'),
    number = getQueryStringByName('number');
if (interval == '') {
    interval = 300;
}
if (number == '') {
    number = 30;
}
// main
var array = [],
    step = [],
    stepN = 0,
    a = [],
    i;
for (i = 0; i < number; i++) {
    array[i] = Math.random();
    a[i] = array[i];
}
var putArrayInStep = function (c, m) {
    step[stepN] = {
        compare: c,
        move: m
    };
    stepN++;
};
for (i = 0; i < a.length - 1; i++) {
    for (var j = 0; j < a.length - 1 - i; j++) {
        if (a[j] > a[j + 1]) {
            var t = a[j];
            a[j] = a[j + 1];
            a[j + 1] = t;
            putArrayInStep(j, 1);
        } else {
            putArrayInStep(j, 0);
        }
    }
}
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
    addCss(css, '.div' + i, 'height: ' + 100 * array[i] + '%;');
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
var stepI = -1,
    compare = function () {
        if (stepI >= 0) {
            div[step[stepI].compare].classList.remove('compare');
            div[step[stepI].compare + 1].classList.remove('compare');
        }
        stepI++;
        if (stepI > stepN) {
            clearTimeout(loop1);
            clearTimeout(loop2);
            return;
        }
        div[step[stepI].compare].classList.add('compare');
        div[step[stepI].compare + 1].classList.add('compare');
        loop2 = setTimeout(move, interval);
    },
    move = function () {
        if (step[stepI].move == 1) {
            var t = div[step[stepI].compare].style.left;
            div[step[stepI].compare].style.left = div[step[stepI].compare + 1].style.left;
            div[step[stepI].compare + 1].style.left = t;
            var divT = div[step[stepI].compare];
            div[step[stepI].compare] = div[step[stepI].compare + 1];
            div[step[stepI].compare + 1] = divT;
        }
        loop1 = setTimeout(compare, interval);
    },
    loop2 = 0,
    loop1 = setTimeout(compare, interval);
