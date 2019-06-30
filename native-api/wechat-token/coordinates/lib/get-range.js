/**
 * @since 150610 10:31
 * @author vivaxy
 */

var http = require('http');

var approach = require('./approach');

var longitude = {
  valid: 121.4156,
};
var latitude = {
  valid: 31.21716,
};
var getUrl = function(lo, la) {
  return '/app/checkin/loadSign?longitude=' + lo + '&latitude=' + la;
};
var request = function(lo, la, callback) {
  setTimeout(function() {
    var url = getUrl(lo, la);
    //console.log('requesting: ' + url);
    http.get(url, function(res) {
      var body = '';
      res.on('data', function(d) {
        body += d;
      });
      res.on('end', function() {
        var result = JSON.parse(body).data.office;
        //console.log('respond with: ' + result);
        return callback && callback(result);
      });
    });
  }, Math.random() * 10000);
};

longitude.lowMin = 0;
longitude.lowMax = longitude.valid;
longitude.highMin = longitude.valid;
longitude.highMax = 180;
longitude.min = 0;
longitude.max = 0;
longitude.get = function(value, callback) {
  request(value, latitude.valid, callback);
};

latitude.lowMin = 0;
latitude.lowMax = latitude.valid;
latitude.highMin = latitude.valid;
latitude.highMax = 90;
latitude.min = 0;
latitude.max = 0;
latitude.get = function(value, callback) {
  request(longitude.valid, value, callback);
};

// get longitude min bound
module.exports = function(callback) {
  var rangeData = {
    longitude: {},
    latitude: {},
  };
  console.log('\n-- getting longitude low bound --');
  approach(longitude.lowMin, longitude.lowMax, longitude.get, function(
    longitudeLow,
  ) {
    rangeData.longitude.low = parseFloat(longitudeLow);
    console.log('\n-- getting longitude high bound --');
    approach(longitude.highMin, longitude.highMax, longitude.get, function(
      longitudeHigh,
    ) {
      rangeData.longitude.high = parseFloat(longitudeHigh);
      console.log('\n-- getting latitude low bound --');
      approach(latitude.lowMin, latitude.lowMax, latitude.get, function(
        latitudeLow,
      ) {
        rangeData.latitude.low = parseFloat(latitudeLow);
        console.log('\n-- getting latitude high bound --');
        approach(latitude.highMin, latitude.highMax, latitude.get, function(
          latitudeHigh,
        ) {
          rangeData.latitude.high = parseFloat(latitudeHigh);
          callback && callback(rangeData);
        });
      });
    });
  });
};
