/**
 * @since 15-08-25 14:50
 * @author vivaxy
 */
'use strict';
var log = require('./log.js'),
    Person = function (age) {
        this.age = age;
        log('new instance of person');
    };

Person.prototype.grow = function () {
    this.age++;
    return this;
};

module.exports = new Person(24);
