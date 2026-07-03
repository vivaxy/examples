const Module = require('module');

const moduleRequire = Module.prototype.require;
Module.prototype.require = function (path) {
  console.log(path, moduleRequire.call(this, path));
  return moduleRequire.call(this, path);
};

require('./m1.js');
require('./m2.txt');
