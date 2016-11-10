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

var searchService = new qq.maps.SearchService({
    //请求成功回调函数
    complete: function(results) {
        var pois = results.detail.pois;
        var infoWin = new qq.maps.InfoWindow({
            map: map
        });
        var latlngBounds = new qq.maps.LatLngBounds();
        for (var i = 0, l = pois.length; i < l; i++) {
            var poi = pois[i];
            //扩展边界范围，用来包含搜索到的Poi点
            latlngBounds.extend(poi.latLng);
        }
        //调整地图视野
        map.fitBounds(latlngBounds);
    },
    error: function() {
        alert("出错了，请输入正确的经纬度！！！");
    }
});

searchService.search('上海');
