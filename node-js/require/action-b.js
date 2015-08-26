/**
 * @since 15-08-25 14:51
 * @author vivaxy
 */
'use strict';
var log = require('./log.js'),
    person = require('./person.js');
person.grow();
log('action-b', 'person.age ===', person.age);
module.exports = person;
