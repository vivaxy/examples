/**
 * @since 2016-04-05 10:19
 * @author vivaxy
 */

'use strict';

var btn = document.querySelector('.js-open-modal');
var modalOverlay = document.querySelector('.js-modal-overlay');
var modalWrapper = document.querySelector('.js-modal-wrapper');

var MODAL_OPEN_CLASS_NAME = 'modal-open';
var body = document.body;
var bodyClassList = body.classList;

modalOverlay.addEventListener('click', function () {
    bodyClassList.remove(MODAL_OPEN_CLASS_NAME);
});
modalWrapper.addEventListener('click', function (e) {
    e.stopPropagation();
});
btn.addEventListener('click', function () {
    bodyClassList.add(MODAL_OPEN_CLASS_NAME);
});
