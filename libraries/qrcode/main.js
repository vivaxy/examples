/**
 * @since 150215 14:31
 * @author vivaxy
 */
var t2q = function() {
  $('#qrcode-canvas')
    .html('')
    .qrcode({
      text: utf16to8($('#txt').val()),
    });
};

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

function saveAsLocalImage() {
  var myImage = document.getElementById('qrCanvas');
  location.href = myImage
    .toDataURL('image/png')
    .replace(/^data:image\/[^;]/, 'data:application/octet-stream');
  // window.open(image, "qrcode.png");
}

$('#txt').on('keyup', t2q);

document.getElementById('download').onclick = function() {
  saveAsLocalImage();
};
