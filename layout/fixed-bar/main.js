/**
 * @since 150125 20:08
 * @author vivaxy
 */
window.scrollTo(0, 0);

var images = document.querySelectorAll('img');

var loadedImages = 0;

var bindAction = function () {
    var originalBar = document.querySelector('.j-fixed-bar');
    var topPosition = originalBar.offsetTop;
    var bar = originalBar.cloneNode(true);
    bar.classList.add('fixed-bar');
    bar.classList.add('hide');
    document.body.appendChild(bar);

    document.addEventListener('scroll', function (e) {

        if (document.body.scrollTop > topPosition) {
            bar.classList.remove('hide');
        } else if (document.body.scrollTop < topPosition) {
            bar.classList.add('hide');
        }

    }, false);
};

for (var i = 0; i < images.length; i++) {
    images[i].addEventListener('load', function (e) {
        loadedImages++;
        if (loadedImages == images.length) {
            bindAction();
        }
    }, false)
    ;
}
