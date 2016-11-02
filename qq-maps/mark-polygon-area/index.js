/**
 * @since 2016-10-10 20:36
 * @author vivaxy
 */

var zoom = 14;

var latlng = new qq.maps.LatLng(-31.2162311, 121.4203236);

var container = document.querySelector('.js-container');

var map = new qq.maps.Map(container, {
    center: latlng,
    zoom: zoom,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    disableDefaultUI: true,
});

var cityLocation = new qq.maps.CityService({
    //请求成功回调函数
    complete: function(result) {
        map.setCenter(result.detail.latLng);
    },
    error: function() {
        alert("出错了，请输入正确的经纬度！！！");
    }
});

cityLocation.searchCityByName('上海');
