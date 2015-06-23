/**
 * @author     : vivaxy
 * @date       : 2015-04-09 16:28:20
 * @modified by: vivaxy
 * @modified   : 2015-04-09 16:29:19
 */

'use strict';

var extend = function (child, parent) {
    var Constructor = function () {
        this.constructor = child;
    };
    Constructor.prototype = parent.prototype;
    child.prototype = new Constructor();
    child.__super__ = parent.prototype;
    return child;
};
