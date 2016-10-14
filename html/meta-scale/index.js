/**
 * @since 2016-10-14 14:24
 * @author vivaxy
 */

var isRetina = function () {
    var mediaQuery;
    if (typeof window !== "undefined" && window !== null) {
        mediaQuery = "(-webkit-min-device-pixel-ratio: 1.25), (min--moz-device-pixel-ratio: 1.25), (-o-min-device-pixel-ratio: 5/4), (min-resolution: 1.25dppx)";
        if (window.devicePixelRatio > 1.25) {
            return true;
        }
        if (window.matchMedia && window.matchMedia(mediaQuery).matches) {
            return true;
        }
    }
    return false;
};

var meta = document.createElement('meta');
var scale = isRetina() ? 0.5 : 1;
meta.setAttribute('name', 'viewport');
meta.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
document.head.appendChild(meta);
