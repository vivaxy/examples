/**
 * @since 15-09-16 10:50
 * @author vivaxy
 */
/**
 * @since 15-09-06 11:15
 * @author vivaxy
 */
'use strict';
var log = function () {
    console.log.apply(console, arguments);
    return log;
};

log('begin', '1.js');

var logLastScript = function () {
    var scripts = document.getElementsByTagName('script');
    var script = scripts[scripts.length - 1];
    log('last script', script.src, script.innerHTML);
    return script;
};

var logLastElement = function () {
    var elements = document.querySelectorAll('*');
    var element = elements[elements.length - 1];
    log('last element', element);
    log('body', document.documentElement.innerHTML);
    return element;
};

logLastScript();
logLastElement();

log('end', '1.js');
