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
  animateEnable: true,
});

// 加载行政区划插件
AMap.service('AMap.DistrictSearch', () => {
  // 实例化DistrictSearch
  var district = new AMap.DistrictSearch({
    level: 'district', // country、province、city、district、biz_area
    extensions: 'all',
  });
  // 行政区查询
  district.search('长宁区', function(status, result) {
    if (status === 'complete') {
      var bounds = result.districtList[0].boundaries;
      var polygons = [];
      if (bounds) {
        for (var i = 0, l = bounds.length; i < l; i++) {
          // 生成行政区划polygon
          var polygon = new AMap.Polygon({
            map: map,
            path: bounds[i],

            strokeColor: '#f33', //线颜色
            strokeOpacity: 1, //线透明度
            strokeWeight: 1, //线粗细度
            fillColor: '#ee2200', //填充颜色
            fillOpacity: 0.2, //填充透明度
          });
          polygons.push(polygon);
        }
        map.setFitView(); // 地图自适应
      }
    }
  });
});
