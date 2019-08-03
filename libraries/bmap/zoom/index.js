/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var zoomIn = document.querySelector('.js-zoom-in');
var zoomOut = document.querySelector('.js-zoom-out');
var container = document.querySelector('.js-container');

var maxZoom = 19;
var minZoom = 0;
var zoom = 19;
var lng = 121.4203236;
var lat = 31.2162311;

var centerPoint = new BMap.Point(lng, lat);

// 百度地图API功能
var map = new BMap.Map(container); // 创建Map实例
map.centerAndZoom(centerPoint, zoom); // 初始化地图,设置中心点坐标和地图级别
map.disableDragging();
map.disableDoubleClickZoom();
// map.enableContinuousZoom();
map.disablePinchToZoom();

var setButtonStatus = () => {
  zoomOut.setAttribute('disabled', true);
  zoomIn.setAttribute('disabled', true);
  if (zoom > minZoom) {
    zoomOut.removeAttribute('disabled');
  }
  if (zoom < maxZoom) {
    zoomIn.removeAttribute('disabled');
  }
};

zoomIn.addEventListener('click', () => {
  // map.setZoomAndCenter(zoom++, center);
  if (zoom < maxZoom) {
    zoom++;
    map.zoomIn();
  }
  setButtonStatus();
});

zoomOut.addEventListener('click', () => {
  // map.setZoomAndCenter(zoom--, center);
  if (zoom > minZoom) {
    zoom--;
    map.zoomOut();
  }
  setButtonStatus();
});

setButtonStatus();
