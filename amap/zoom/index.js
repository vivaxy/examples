/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var zoomIn = document.querySelector('.js-zoom-in');
var zoomOut = document.querySelector('.js-zoom-out');

var maxZoom = 19;
var minZoom = 3;

var zoom = 14;
var center = [
    121.4203236,
    31.2162311
];

var container = document.querySelector('.js-container');

var map = new AMap.Map(container, {
    center: center,
    zoom: zoom,
    dragEnable: false,
    doubleClickZoom: false,
    keyboardEnable: false,
    scrollWheel: false,
    touchZoom: false,
    animateEnable: true,
});

zoomIn.addEventListener('click', () => {
    // map.setZoomAndCenter(zoom++, center);
    if (zoom < maxZoom) {
        zoom++;
        map.setZoom(zoom);
        zoomOut.removeAttribute('disabled');
    } else {
        zoomIn.setAttribute('disabled', true);
    }
});

zoomOut.addEventListener('click', () => {
    // map.setZoomAndCenter(zoom--, center);
    if (zoom > minZoom) {
        zoom--;
        map.setZoom(zoom);
        zoomIn.removeAttribute('disabled');
    } else {
        zoomOut.setAttribute('disabled', true);
    }
});
