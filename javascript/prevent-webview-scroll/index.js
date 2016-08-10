/**
 * @since 2016-08-10 13:58
 * @author vivaxy
 */

var modalBackground = document.querySelector('.js-modal-background');
var modalWrapper = document.querySelector('.js-modal-wrapper');

var showModal = document.querySelector('.js-show-modal');

showModal.addEventListener('click', function() {
    document.body.classList.add('modal-open');
    modalBackground.classList.remove('hide');
});

modalBackground.addEventListener('click', function() {
    modalBackground.classList.add('hide');
    document.body.classList.remove('modal-open');
});

modalWrapper.addEventListener('click', function(e) {
    e.stopPropagation();
});

modalBackground.addEventListener('touchmove', function(e) {
    e.preventDefault();
});

modalWrapper.addEventListener('touchmove', function(e) {
    e.stopPropagation();
});
