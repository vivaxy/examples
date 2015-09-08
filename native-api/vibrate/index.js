/**
 * @since 15-09-08 19:55
 * @author vivaxy
 */
'use strict';

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function (duration) {
        alert('vibrate not supported ' + JSON.stringify(duration));
    };

var vibrateInterval;

// Starts vibration at passed in level
var startVibrate = function (duration) {
    navigator.vibrate(duration);
};

// Stops vibration
var stopVibrate = function () {
    // Clear interval and stop persistent vibrating
    if (vibrateInterval) clearInterval(vibrateInterval);
    navigator.vibrate(0);
};

// Start persistent vibration at given duration and interval
// Assumes a number value is given
var startPersistentVibrate = function (duration, interval) {
    vibrateInterval = setInterval(function () {
        startVibrate(duration);
    }, interval);
};

var vibrating = false;

window.addEventListener('click', function () {
    if (vibrating) {
        stopVibrate();
    } else {
        startPersistentVibrate(999, 1);
    }
    vibrating = !vibrating;
}, false);
