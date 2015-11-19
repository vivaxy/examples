/**
 * @since 150213 16:57
 * @author vivaxy
 */
var log = function (e) {
    var currentTarget = e.currentTarget;
    var rect = currentTarget.getBoundingClientRect();
    var coordinate = e.coordinate;
    var clientCoordinate = coordinate.client;
    var x = clientCoordinate.x - rect.left;
    var y = clientCoordinate.y - rect.top;
    console.log({
        x: x,
        y: y
    });
    document.querySelector('.console').innerHTML = 'x: ' + x + '; y: ' + y;
};

document.querySelector('.test').addEventListener('tap', function (e) {
    log(e);
});
