/**
 * @since 2014/9/9 9:18
 * @author vivaxy
 */
var handleDeviceOrientationEvent = function (e) {
    console.log(e);
    document.getElementsByClassName("deviceorientation")[0].innerHTML = "absolute : " + e.absolute + "<br />" +
        "alpha : " + e.alpha + "<br />" +
        "beta : " + e.beta + "<br />" +
        "gamma : " + e.gamma + "<br />" +
        "timeStamp : " + e.timeStamp + "<br />" +
        "compassCalibrated : " + e.compassCalibrated + "<br />";
};
window.addEventListener('deviceorientation', handleDeviceOrientationEvent, false);

var handleDeviceMotionEvent = function (e) {
    console.log(e);
    document.getElementsByClassName("devicemotion")[0].innerHTML = "acceleration : " + "<br />" +
        "x : " + e.acceleration.x + "<br />" +
        "y : " + e.acceleration.y + "<br />" +
        "z : " + e.acceleration.z + "<br />" +
        "accelerationIncludingGravity : " + "<br />" +
        "x : " + e.accelerationIncludingGravity.x + "<br />" +
        "y : " + e.accelerationIncludingGravity.y + "<br />" +
        "z : " + e.accelerationIncludingGravity.z + "<br />" +
        "rotationRate : " + "<br />" +
        "alpha : " + e.rotationRate.alpha + "<br />" +
        "beta : " + e.rotationRate.beta + "<br />" +
        "gamma : " + e.rotationRate.gamma + "<br />" +
        "interval : " + e.interval + "<br />" +
        "timeStamp : " + e.timeStamp + "<br />";
    shakeHandler(e.accelerationIncludingGravity);
};
window.addEventListener('devicemotion', handleDeviceMotionEvent, false);