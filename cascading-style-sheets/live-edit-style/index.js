/**
 * @since 2015-10-09 10:32
 * @author vivaxy
 */
'use strict';
var style = document.querySelector('style');
style.addEventListener('keydown', function (e) {
    // trap the return key being pressed
    if (e.keyCode === 13) {
        e.preventDefault();
        document.execCommand('insertHTML', false, '<br><br>');
        return false;
    }
}, false);
style.focus();

