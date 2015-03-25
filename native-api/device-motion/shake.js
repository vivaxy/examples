/**
 * @since 2014/9/9 10:05
 * @author vivaxy
 */
var SHAKE_THRESHOLD = 500;
var lastTime = 0;
var x, y, z, lastX, lastY, lastZ;

var shakeHandler = function (acceleration) {

    var curTime = new Date().getTime();
    var diffTime = curTime - lastTime;

    if (diffTime > 200) {

        lastTime = curTime;

        x = acceleration.x;
        y = acceleration.y;
        z = acceleration.z;

        var speed = Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > SHAKE_THRESHOLD) {
            alert("shook!");
        }

        lastX = x;
        lastY = y;
        lastZ = z;
    }
};