/**
 * @since 150215 14:31
 * @author vivaxy
 */
var t2q = function () {
    $('#qrcode-canvas').html('').qrcode({
        text: utf16to8($('#txt').val())
    });
};

var utf16to8 = function (str) {
    var out, i, len, c;
    out = '';
    len = str.length;
    for (i = 0; i < len; i++) {
        c = str.charCodeAt(i);
        if ((c >= 0x0001) && (c <= 0x007F)) {
            out += str.charAt(i);
        } else if (c > 0x07FF) {
            out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
            out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        } else {
            out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
            out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
        }
    }
    return out;
};

function saveAsLocalImage() {
    var myImage = document.getElementById('qrCanvas');
    location.href = myImage.toDataURL('image/png').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
    // window.open(image, "qrcode.png");
}

$('#txt').on('keyup', t2q);

document.getElementById('download').onclick = function () {
    saveAsLocalImage();
};