/**
 * @since 15-08-26 11:15
 * @author vivaxy
 */
'use strict';
var log = require('./log.js'),
    person = require('./person.js');
person.grow();
log('action-a', 'person.age ===', person.age);
module.exports = person;
