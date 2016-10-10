/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var map = new AMap.Map('container', {
    center: [
        121.4203236,
        31.2162311
    ],
    zoom: 14,
    dragEnable: false,
    zoomEnable: false,
    doubleClickZoom: false,
    keyboardEnable: false,
    scrollWheel: false,
    touchZoom: false,
});

var marker = new AMap.Marker({
    icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
    position: [
        121.4203236,
        31.2162311
    ]
});
marker.setMap(map);
