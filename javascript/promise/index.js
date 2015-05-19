/*
 * @author     : vivaxy
 * @date       : 2015-04-07 14:49:36
 * @modified by: vivaxy
 * @modified   : 2015-04-07 15:33:06
 */

'use strict';

var ref = function (value) {
    if (value && typeof value.then === "function") {
        return value;
    }
    return {
        then: function (callback) {
            return ref(callback(value));
        }
    };
};

ref(10).then(function (value) {
    console.log(value);
    return 15;
}).then(function (value) {
    console.log(value);
    return this;
}).then(function (value) {
    console.log(value);
});
