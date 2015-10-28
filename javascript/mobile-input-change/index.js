/**
 * @since 2015-10-28 09:55
 * @author vivaxy
 */
'use strict';
var input = document.querySelector('.js-input');
var screen = document.querySelector('.js-screen');
var getText = function () {
    var value = input.value;
    if (savedInputValue !== value) {
        savedInputValue = value;
        screen.innerHTML = value;
    }
};
var getTextInterval;
var savedInputValue = '';

input.addEventListener('focus', function () {
    getTextInterval = setInterval(getText, 500);
});

input.addEventListener('blur', function () {
    clearInterval(getTextInterval);
});
