/*
 * @author     : vivaxy
 * @date       : 2015-04-07 12:19:42
 * @modified by: vivaxy
 * @modified   : 2015-04-07 14:27:12
 */
'use strict';

var loadScript = function (url, callback) {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    if (script.readyState) {
        //script.onreadystatechange = function () {
        script.addEventListener('readystatechange', function () {
            if (script.readystate === 'loaded' || script.readystate === 'complete') {
                script.onreadystatechange = null;
                callback();
            }
        });
    } else {
        //script.onload = function () {
        script.addEventListener('load', function () {
            callback();
        });
    }
    script.src = url;
    document.getElementsByTagName('head')[0].appendChild(script);
};
