/**
 * @since 20180717 16:41
 * @author vivaxy
 */

const Module = require('module');

const moduleRequire = Module.prototype.require;
Module.prototype.require = function(path) {
  console.log(path, moduleRequire.call(this, path));
  return moduleRequire.call(this, path);
};

require('./m1.js');
require('./m2.txt');
