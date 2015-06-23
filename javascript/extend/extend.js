/**
 * @author     : vivaxy
 * @date       : 2015-04-09 16:28:20
 * @modified by: vivaxy
 * @modified   : 2015-04-09 16:29:19
 */

'use strict';

var extend = function (child, parent) {
    var ctor = function () {
        this.constructor = child;
    };
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;
    return child;
};
