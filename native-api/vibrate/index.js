/**
 * @since 15-09-08 19:55
 * @author vivaxy
 */
'use strict';

navigator.vibrate = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate || function (duration) {
        alert('vibrate not supported ' + JSON.stringify(duration));
    };

var vibrateInterval;

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
        navigator.vibrate(duration);
    }, interval);
};

var vibrating = false;
var durationInput = document.getElementById('duration');
var intervalInput = document.getElementById('interval');
var switchInput = document.getElementById('switch');

switchInput.addEventListener('click', function () {
    if (vibrating) {
        stopVibrate();
    } else {
        startPersistentVibrate(durationInput.value, intervalInput.value);
    }
    vibrating = !vibrating;
}, false);
