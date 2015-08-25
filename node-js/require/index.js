/**
 * @since 15-08-25 14:50
 * @author vivaxy
 */
'use strict';
var person = require('./person.js');
console.log(new Date().getTime(), 'first require of person');
person = require('./other.js');
person = require('./other.js');
person.grow();

console.log(person.age);
