/**
 * @since 20180525 16:25
 * @author vivaxy
 */

function init() {
  const deviceorientationEl = document.querySelector('.deviceorientation');
  const devicemotionEl = document.querySelector('.devicemotion');
  window.addEventListener('deviceorientation', handleDeviceOrientationEvent);
  window.addEventListener('devicemotion', handleDeviceMotionEvent);

  function handleDeviceOrientationEvent(e) {
    console.log(e);
    deviceorientationEl.innerHTML =
      '<h4>deviceorientation</h4>' +
      'absolute : ' +
      e.absolute +
      '<br >' +
      'alpha : ' +
      e.alpha +
      '<br >' +
      'beta : ' +
      e.beta +
      '<br >' +
      'gamma : ' +
      e.gamma +
      '<br >' +
      'timeStamp : ' +
      e.timeStamp +
      '<br >' +
      'compassCalibrated : ' +
      e.compassCalibrated +
      '<br >';
  }

  function handleDeviceMotionEvent(e) {
    console.log(e);
    devicemotionEl.innerHTML =
      '<h4>devicemotion</h4>' +
      'acceleration : ' +
      '<br >' +
      'x : ' +
      e.acceleration.x +
      '<br >' +
      'y : ' +
      e.acceleration.y +
      '<br >' +
      'z : ' +
      e.acceleration.z +
      '<br >' +
      'accelerationIncludingGravity : ' +
      '<br >' +
      'x : ' +
      e.accelerationIncludingGravity.x +
      '<br >' +
      'y : ' +
      e.accelerationIncludingGravity.y +
      '<br >' +
      'z : ' +
      e.accelerationIncludingGravity.z +
      '<br >' +
      'rotationRate : ' +
      '<br >' +
      'alpha : ' +
      e.rotationRate.alpha +
      '<br >' +
      'beta : ' +
      e.rotationRate.beta +
      '<br >' +
      'gamma : ' +
      e.rotationRate.gamma +
      '<br >' +
      'interval : ' +
      e.interval +
      '<br >' +
      'timeStamp : ' +
      e.timeStamp +
      '<br >';
  }
}

export default { init };
