/**
 * @since 150531 10:11
 * @author vivaxy
 */
var label1 = document.querySelector('.label-1'),
    input1 = document.querySelector('.input-1'),
    listenClickEvent = function (dom, callback) {
        dom.addEventListener('click', callback, false);
    };

listenClickEvent(label1, function (e) {
    console.log('label-1 clicked');
});

listenClickEvent(input1, function (e) {
    console.log('input-1 clicked');
});
