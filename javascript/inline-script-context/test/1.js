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
