/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var zoom = 14;
var center = [121.4203236, 31.2162311];

var container = document.querySelector('.js-container');

var map = new AMap.Map(container, {
  center: center,
  zoom: zoom,
  dragEnable: false,
  doubleClickZoom: false,
  keyboardEnable: false,
  scrollWheel: false,
  touchZoom: false,
});

var marker = new AMap.Marker({
  icon: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
  position: center,
});
marker.setMap(map);
