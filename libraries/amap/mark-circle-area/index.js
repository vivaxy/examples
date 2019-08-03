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

var circle = new AMap.Circle({
  center: new AMap.LngLat(121.4203236, 31.2162311), // 圆心位置
  radius: 1000, //半径
  strokeColor: '#f33', //线颜色
  strokeOpacity: 1, //线透明度
  strokeWeight: 1, //线粗细度
  fillColor: '#ee2200', //填充颜色
  fillOpacity: 0.2, //填充透明度
});

circle.setMap(map);
