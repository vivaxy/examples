'use strict';
var log = require('./log.js'),
  person = require('./person.js');
person.grow();
log('action-b', 'person.age ===', person.age);
module.exports = person;
