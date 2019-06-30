/**
 * @since 2017-01-26 19:02
 * @author vivaxy
 */
var textarea = document.querySelector('.js-text');
var sign = document.querySelector('.js-sign');
var check = document.querySelector('.js-check');

var getURLPartFromText = function(area) {
  var text = area.value;
  var url = new URL(text, location.href);
  var url$origin = url.origin;
  var url$hash = url.hash;
  var hashURL = new URL(url$hash.slice(1), text);
  var hashURL$SearchParams = hashURL.searchParams;
  var uuid = hashURL$SearchParams.get('uuid_token');
  return {
    origin: url$origin,
    uuid: uuid,
  };
};

sign.addEventListener('click', function() {
  if (!this.hasAttribute('disabled')) {
    this.setAttribute('disabled', '');
    var urlParts = getURLPartFromText(textarea);
    var data = {
      longitude: {
        low: 121.4146,
        high: 121.4166,
      },
      latitude: {
        low: 31.21616,
        high: 31.21816,
      },
    };
    var getValue = function(name) {
      return (
        Math.random() * (data[name].high - data[name].low) +
        data[name].low
      ).toFixed(5);
    };
    location.href =
      urlParts.origin +
      '/app/checkin/loadSign?uuid=' +
      urlParts.uuid +
      '&longitude=' +
      getValue('longitude') +
      '&latitude=' +
      getValue('latitude');
  }
});

check.addEventListener('click', function() {
  if (!this.hasAttribute('disabled')) {
    this.setAttribute('disabled', '');
    var urlParts = getURLPartFromText(textarea);
    location.href =
      urlParts.origin + '/app/checkin.html#/search?uuid_token=' + urlParts.uuid;
  }
});
