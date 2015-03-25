/**
 * @since 150116 10:16
 * @author vivaxy
 */
// 创建地图实例
var map = new BMap.Map("container");
// 上海
var point = new BMap.Point(121.426907, 31.221611);
// 北京
var point1 = new BMap.Point(116.404, 39.915);
// 初始化地图，设置中心点坐标和地图级别
map.centerAndZoom(point1, 15);

// 2秒后
setTimeout(function () {
  //移动到公司
  map.panTo(point);
  //1秒后
  setTimeout(function () {
    //缩放
    map.setZoom(30);
  }, 1000)
}, 2000);

// 平移缩放控件
map.addControl(new BMap.NavigationControl());
// 比例尺控件
map.addControl(new BMap.ScaleControl());
// 缩略图控件
map.addControl(new BMap.OverviewMapControl());
map.addControl(new BMap.MapTypeControl());
// 仅当设置城市信息时，MapTypeControl的切换功能才能可用
map.setCurrentCity("上海");

//地理位置解析
var geoc = new BMap.Geocoder();

//点击
map.addEventListener("click", function (e) {
  console.log('clicked ', e.point.lng, e.point.lat);
  geoc.getLocation(e.point, function (rs) {
    var addComp = rs.addressComponents;
    console.log(addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
  });
});

//拖动事件
map.addEventListener("dragend", function () {
  var center = map.getCenter();
  console.log('center moved to ', center.lng, center.lat);
});

