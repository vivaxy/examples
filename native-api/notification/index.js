/**
 * @since 2016-02-04 15:59
 * @author vivaxy
 */

'use strict';

var notify = function (title, options) {
    // Check if the browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notification');
    } else if (Notification.permission === 'granted') {
        // Check whether notification permissions have already been granted

        // If it's okay let's create a notification
        var notification = new Notification(title, options);
    } else if (Notification.permission !== 'denied') {
        // Otherwise, we need to ask the user for permission

        Notification.requestPermission(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === 'granted') {
                var notification = new Notification(title, options);
            }
        });
    }
};

var sendButton = document.querySelector('.js-send');
var bodyInput = document.querySelector('.js-body');
var titleInput = document.querySelector('.js-title');
var iconInput = document.querySelector('.js-icon');

sendButton.addEventListener('click', function () {
    var title = titleInput.value;
    var options = {
        body: bodyInput.value,
        icon: iconInput.value
    };
    notify(title, options);
});
