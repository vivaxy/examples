/**
 * @since 15-08-03 09:58
 * @author vivaxy
 */
var nameInput = document.querySelector('#name'),
    submitButton = document.querySelector('.submit-button'),
    nameContainer = document.querySelector('.name-container'),
    appendScript = function (src) {
        var script1 = document.createElement('script');
        script1.src = src;
        document.body.appendChild(script1);
    };

submitButton.addEventListener('click', function () {
    appendScript('./js/1.js');
    appendScript('./js/2.js');
    console.log(0);
}, false);
