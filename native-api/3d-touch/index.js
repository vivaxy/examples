/**
 * @since 2016-01-19 15:24
 * @author vivaxy
 */

'use strict';

var body = document.querySelector('body');
var touchList = document.querySelector('touch-list');

var forEach = function (arrayLike, callback) {
    return Array.prototype.forEach.call(arrayLike, callback);
};

var logTouch = function (touch) {
    var touchLogger = document.createElement('touch');
    touchLogger.textContent = touch.force;
    touchList.appendChild(touchLogger);
};

var clearTouchList = function () {
    while (touchList.childElementCount) {
        touchList.removeChild(touchList.firstElementChild);
    }
    return touchList;
};

body.addEventListener('touchstart', function (e) {
    clearTouchList();
    var touches = e.targetTouches;
    forEach(touches, logTouch);
});
