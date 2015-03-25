/**
 * @since 150116 10:16
 * @author vivaxy
 */
// 创建地图实例
var map = new BMap.Map("container");
// 上海
var point = new BMap.Point(121.426907, 31.221611);
// 初始化地图，设置中心点坐标和地图级别
map.centerAndZoom(point, 15);

// 浏览器定位
var geolocation = new BMap.Geolocation();
geolocation.getCurrentPosition(function (r) {
  if (this.getStatus() == BMAP_STATUS_SUCCESS) {
    var mk = new BMap.Marker(r.point);
    map.addOverlay(mk);
    map.panTo(r.point);
    console.log('您的位置', r.point.lng, r.point.lat);
    var geoc = new BMap.Geocoder();
    geoc.getLocation(r.point, function (rs) {
      var addComp = rs.addressComponents;
      console.log('您的地址', addComp.province + ", " + addComp.city + ", " + addComp.district + ", " + addComp.street + ", " + addComp.streetNumber);
    });
  }
  else {
    console.log('failed', this.getStatus());
    // ip定位
    var myCity = new BMap.LocalCity();
    myCity.get(function(result){
      var cityName = result.name;
      map.setCenter(cityName);
      console.log("当前定位城市", cityName);
    });
  }
}, {enableHighAccuracy: true});

//关于状态码
//BMAP_STATUS_SUCCESS	检索成功。对应数值“0”。
//BMAP_STATUS_CITY_LIST	城市列表。对应数值“1”。
//BMAP_STATUS_UNKNOWN_LOCATION	位置结果未知。对应数值“2”。
//BMAP_STATUS_UNKNOWN_ROUTE	导航结果未知。对应数值“3”。
//BMAP_STATUS_INVALID_KEY	非法密钥。对应数值“4”。
//BMAP_STATUS_INVALID_REQUEST	非法请求。对应数值“5”。
//BMAP_STATUS_PERMISSION_DENIED	没有权限。对应数值“6”。(自 1.1 新增)
//BMAP_STATUS_SERVICE_UNAVAILABLE	服务不可用。对应数值“7”。(自 1.1 新增)
//BMAP_STATUS_TIMEOUT	超时。对应数值“8”。(自 1.1 新增)

