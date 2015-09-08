/**
 * @since 15-09-08 19:55
 * @author vivaxy
 */
'use strict';

var vibrate = function () {
    navigator.vibrate([100, 30, 100, 30, 100, 200, 200, 30, 200, 30, 200, 200, 100, 30, 100, 30, 100]);
};

window.addEventListener('click', vibrate, false);
