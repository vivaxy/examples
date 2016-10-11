/**
 * @since 2016-10-11 19:24
 * @author vivaxy
 */

var zoom = 14;
var lng = 121.4203236;
var lat = 31.2162311;
var radius = 1000;

var centerPoint = new BMap.Point(lng, lat);

// 百度地图API功能
var map = new BMap.Map('allmap');    // 创建Map实例
map.centerAndZoom(centerPoint, zoom);  // 初始化地图,设置中心点坐标和地图级别
map.disableDragging();
map.disableDoubleClickZoom();
// map.enableContinuousZoom();
map.disablePinchToZoom();

var circle = new BMap.Circle(centerPoint, radius, {
    strokeColor: '#f33',
    fillColor: '#ee2200',
    strokeWeight: 1,
    strokeOpacity: 1,
    fillOpacity: 0.2,
    strokeStyle: 'solid',
    enableClicking: false,
});
map.addOverlay(circle);
