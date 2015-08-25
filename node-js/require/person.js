/**
 * @since 15-08-25 14:50
 * @author vivaxy
 */
'use strict';
var Person = function (age) {
    this.age = age;
    console.log('new instance');
};

Person.prototype.grow = function () {
    this.age++;
    return this;
};

module.exports = new Person(24);
