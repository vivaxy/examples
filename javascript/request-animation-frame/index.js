/**
 * @since 150628 13:18
 * @author vivaxy
 */

var n = 0,
    flash = function () {
        document.querySelector('.flash').style.transform = 'rotate(' + n++ + 'deg)';
        requestAnimationFrame(flash);
    };

flash();
