/**
 * @since 15-08-25 14:50
 * @author vivaxy
 */
'use strict';
var log = require('./log.js'),
    person = {};
log('index', 'before require a');
person.a = require('./action-a.js');
log('index', 'after require a');
log('index', 'before require b');
person.b = require('./action-b.js');
log('index', 'after require b');

log('(person.a === person.b) ===', person.a === person.b);
