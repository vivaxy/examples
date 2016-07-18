/**
 * @since 2016-07-18 10:16
 * @author vivaxy
 */

'use strict';

var loadResourceAsArrayBuffer = function (src, callback) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'arraybuffer';
    xhr.addEventListener('progress', function (event) {
        console.log(src, event.loaded + '/' + event.total);
    });
    xhr.addEventListener('load', callback);
    xhr.open('GET', src);
    xhr.send();
};
var appendTag = function (name, src) {
    var tag = document.createElement(name);
    switch (name) {
        case 'audio':
        case 'video':
            tag.autoplay = true;
            break;
        default:
            break;
    }
    tag.src = src;
    document.body.appendChild(tag);
    return tag;
};

loadResourceAsArrayBuffer('./resource/tree.png', function () {
    appendTag('img', './resource/tree.png');
});
loadResourceAsArrayBuffer('./resource/summer.mp3', function () {
    appendTag('audio', './resource/summer.mp3');
});
loadResourceAsArrayBuffer('./resource/mv.mp4', function () {
    appendTag('video', './resource/mv.mp4');
});
