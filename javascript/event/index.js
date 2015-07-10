/*
 * @author     : vivaxy
 * @date       : 2015-04-08 13:54:45
 * @modified by: vivaxy
 * @modified   : 2015-04-08 14:07:55
 */

'use strict';

var event = new Event();

event.on('lol', function (data1, data2) {
    console.log(this, data1, data2);
});

event.fire('lol', 1, 2);

var test  = function (e) {
    console.log(e);
};

event.on('test', test);
event.on('test', test);
event.on('test', test);

event.fire('test', '这是测试');
event.off('test', test);
event.fire('test', '这是测试');
event.off('test');
event.fire('test', '这是测试');
