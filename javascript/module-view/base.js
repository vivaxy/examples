/*
 * @author: vivaxy
 * @date:   2015-04-06 15:52:47
 * @last modified by:   vivaxy
 * @last modified time: 2015-04-06 19:26:59
 */

'use strict';

var Base = function () {

    },
    p = {};
Base.prototype = p;

p.on = function (event, callback) {
    if (!this.hasOwnProperty('events')) throw '`events` not defined in object';
    if (!this.events[event]) {
        this.events[event] = [];
    }
    this.events[event].push(callback);
    return this;
};

p.off = function (event, callback) {
    if (!this.hasOwnProperty('events')) throw '`events` not defined in object';
    if (this.events[event] && callback) {
        this.events[event] = this.events[event].filter(function (cb) {
            return cb !== callback;
        });
    } else {
        this.events[event] = [];
    }
    return this;
};

p.fire = function (event) {
    if (!this.hasOwnProperty('events')) throw '`events` not defined in object';
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

p.render = function () {
    if (!this.hasOwnProperty('container')) throw new Error('`container` not defined in object');
    if (!this.hasOwnProperty('data')) throw new Error('`data` not defined in object');
    this.container.appendChild(this.template(this.data));
    return this;
};

p.template = function () {
    if (!this.hasOwnProperty('data')) throw new Error('`data` not defined in object');
    return document.createDocumentFragment();
};

p.update = function (data) {
    if (!this.hasOwnProperty('data')) throw new Error('`data` not defined in object');
    this.data = data;
    var _this = this;
    Array.prototype.slice.call(this.container.children).forEach(function (child) {
        _this.container.removeChild(child);
    });
    this.render();
    return this;
};
