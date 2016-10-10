/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var zoomIn = document.querySelector('.js-zoom-in');
var zoomOut = document.querySelector('.js-zoom-out');

var zoom = 14;
var center = [
    121.4203236,
    31.2162311
];

var map = new AMap.Map('container', {
    center: center,
    zoom: zoom,
    // dragEnable: false,
    // doubleClickZoom: false,
    // keyboardEnable: false,
    // scrollWheel: false,
    // touchZoom: false,
    animateEnable: true,
});

var marker = new AMap.Marker({
    icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
    position: center,
});
marker.setMap(map);

zoomIn.addEventListener('click', () => {
    // map.setZoomAndCenter(zoom++, center);
    map.setZoom(zoom++);
});

zoomOut.addEventListener('click', () => {
    // map.setZoomAndCenter(zoom--, center);
    map.setZoom(zoom--);
});
