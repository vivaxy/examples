/*
 * @author     : vivaxy
 * @date       : 2015-04-07 12:25:01
 * @modified by: vivaxy
 * @modified   : 2015-04-07 14:27:43
 */

'use strict';

loadScript('1.js', function () {
    loadScript('2.js', function () {
        console.log(3);
    });
});
