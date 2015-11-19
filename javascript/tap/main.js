/**
 * @since 150213 16:57
 * @author vivaxy
 */
var log = function (e) {
    var currentTarget = e.currentTarget;
    var rect = currentTarget.getBoundingClientRect();
    var x = e.client.x - rect.left;
    var y = e.client.y - rect.top;
    console.log({
        x: x,
        y: y
    });
    document.querySelector('.console').innerHTML = 'x: ' + x + '; y: ' + y;
};

document.querySelector('.test').addEventListener('tap', function (e) {
    log(e);
}, false);
