/**
 * @since 2014/8/28 10:35
 * @author vivaxy
 */
var utf16to8 = function(str) {
  var out, i, len, c;
  out = '';
  len = str.length;
  for (i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x0001 && c <= 0x007f) {
      out += str.charAt(i);
    } else if (c > 0x07ff) {
      out += String.fromCharCode(0xe0 | ((c >> 12) & 0x0f));
      out += String.fromCharCode(0x80 | ((c >> 6) & 0x3f));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
    } else {
      out += String.fromCharCode(0xc0 | ((c >> 6) & 0x1f));
      out += String.fromCharCode(0x80 | ((c >> 0) & 0x3f));
    }
  }
  return out;
};

var submitBtn = document.getElementById('submit');
var nameInput = document.getElementById('name');
var homeAddress = document.getElementById('home-address');
var homePhoneNumber = document.getElementById('home-phone-number');

var generateQrcode = function() {
  var txt =
    '姓名：' +
    nameInput.value +
    String.fromCharCode(10) +
    '家庭住址：' +
    homeAddress.value +
    String.fromCharCode(10) +
    '家庭联系电话：' +
    homePhoneNumber.value;
  txt = utf16to8(txt);
  $('#qrcode-canvas').qrcode({
    text: txt,
  });
};

submitBtn.addEventListener('click', generateQrcode, false);
