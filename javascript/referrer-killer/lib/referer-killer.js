/**
 * @since 150722 11:34
 * @author vivaxy
 */
var RefererKiller = function () {
    this.refererKillerIframeId = 0;
};

RefererKiller.prototype.convert = function () {
    var _this = this,
        images = document.querySelectorAll('img[referer-killer-src]');
    Array.prototype.forEach.call(images, function (img) {
        var iframe = document.createElement('iframe');
        iframe.id = 'referer-killer-id-' + _this.refererKillerIframeId++;
        iframe.style.border = 'none';
        // cannot use `data:text/html,`
        // because iframe used `parent` to get parent window, which causes cross origin
        iframe.src = 'javascript: \'<!DOCTYPE html>' +
            '<html>' +
            '<head>' +
            '<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
            '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">' +
            '<style>' +
            'body {' +
            'margin: 0;' +
            'font-size: 0;' +
            '}' +
            '</style>' +
            '</head>' +
            '<body>' +
            '<img src="' + img.getAttribute('referer-killer-src') + '">' +
            '<script>' +
            'window.domain = ' + window.domain + ';' +
            'var img = document.querySelector("img");' +
            'img.addEventListener("load", function(){' +
            'parent.document.querySelector("#' + iframe.id + '").width = img.width;' +
            'parent.document.querySelector("#' + iframe.id + '").height = img.height;' +
            '});' +
            '</script>' +
            '</body>' +
            '</html>\'';
        img.parentNode.replaceChild(iframe, img);
    });
};
