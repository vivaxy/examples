/**
 * @since 150611 13:44
 * @author vivaxy
 */
var windowElement = document.querySelector('.window'),
    windowElementWidth  = windowElement.offsetWidth;

windowElement.style.width += windowElementWidth + getScrollBarWidth() + 'px';
