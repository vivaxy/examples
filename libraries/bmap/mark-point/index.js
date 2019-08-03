/**
 * @since 2016-10-11 19:24
 * @author vivaxy
 */

var zoom = 14;
var lng = 121.4203236;
var lat = 31.2162311;

var container = document.querySelector('.js-container');
var centerPoint = new BMap.Point(lng, lat);

// 百度地图API功能
var map = new BMap.Map(container); // 创建Map实例
map.centerAndZoom(centerPoint, zoom); // 初始化地图,设置中心点坐标和地图级别
map.disableDragging();
map.disableDoubleClickZoom();
// map.enableContinuousZoom();
map.disablePinchToZoom();

var marker = new BMap.Marker(centerPoint);
map.addOverlay(marker);
