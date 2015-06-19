/*
 * @author     : vivaxy
 * @date       : 2015-04-07 17:55:42
 * @modified by: vivaxy
 * @modified   : 2015-04-07 18:14:01
 */

'use strict';

var object = function (o) {
    var F = function () {

    };
    F.prototype = o;
    return new F();
};

var inherit = function (subType, superType) {
    var p = object(superType.prototype);
    p.constructor = subType;
    subType.prototype = p;
    return this;
};

var SuperType = function (name) {
    this.name = name;
    this.numbers = [1, 2, 3];
};

SuperType.prototype.sayName = function () {
    console.log(this.name);
    return this;
};


var SubType = function (name, age) {
    SuperType.call(this, name);
    this.age = age;
};

inherit(SubType, SuperType);

SubType.prototype.sayAge = function () {
    console.log(this.age);
    return this;
};

var sub = new SubType('haha', 12);

sub.sayAge();
