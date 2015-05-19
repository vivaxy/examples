/**
 * @since 150213 16:57
 * @author vivaxy
 */
var log = function (data) {
    console.log(data);
    document.querySelector('.console').innerHTML = 'x: ' + data.x + '; y: ' + data.y;
};

document.querySelector('.test').addEventListener('tap', function (e) {
    log(e);
}, false);
