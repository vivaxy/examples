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

var boundary = new BMap.Boundary(map);
boundary.get('长宁区', (result) => {
  var boundaries = result.boundaries;
  var points = boundaries[0].split(';').map((point) => {
    var info = point.split(',');
    var _lng = info[0];
    var _lat = info[1];
    return new BMap.Point(_lng, _lat);
  });

  var polygon = new BMap.Polygon(points, {
    strokeColor: '#f33',
    fillColor: '#ee2200',
    strokeWeight: 1,
    strokeOpacity: 1,
    fillOpacity: 0.2,
    strokeStyle: 'solid',
    enableClicking: false,
  });
  map.addOverlay(polygon);
  var viewport = map.getViewport(points);
  map.setViewport(viewport);
});
