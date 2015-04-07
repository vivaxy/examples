/*
 * @author     : vivaxy
 * @date       : 2015-04-07 17:34:57
 * @modified by: vivaxy
 * @modified   : 2015-04-07 17:51:22
 */

'use strict';

var me = {
    _name: 'vivaxy'
};

Object.defineProperty(me, 'name', {
    get: function () {
        return this._name;
    },
    set: function (name) {
        if (name !== 'vivaxy') {
            throw 'my name is vivaxy, and you cannot change it.';
        }
        return this;
    }
});
