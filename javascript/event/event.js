/*
 * @author     : vivaxy
 * @date       : 2015-04-08 13:53:42
 * @modified by: vivaxy
 * @modified   : 2015-04-08 14:08:39
 */

'use strict';

var Event = function () {
        this.events = {};
    },
    p = Event.prototype;

p.on = function (event, callback) {
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
};

p.fire = function (event) {
    var callbacks = this.events[event],
        _this = this,
        _arguments = arguments;
    if (callbacks) {
        callbacks.forEach(function (callback) {
            callback.apply(_this, Array.prototype.slice.call(_arguments, 1));
        });
    }
    return this;
};

p.off = function (event, callback) {
    if (this.events[event] && callback) {
        this.events[event] = this.events[event].filter(function (cb) {
            return cb !== callback;
        });
    } else {
        this.events[event] = [];
    }
    return this;
};
