/**
 * @since 2014/9/9 10:05
 * @author vivaxy
 */

function init() {
  const SHAKE_THRESHOLD = 500;
  let lastTime = 0;
  let x, y, z, lastX, lastY, lastZ;

  function shakeHandler(e) {
    const acceleration = e.accelerationIncludingGravity;

    const curTime = new Date().getTime();
    const diffTime = curTime - lastTime;

    if (diffTime > 200) {
      lastTime = curTime;

      x = acceleration.x;
      y = acceleration.y;
      z = acceleration.z;

      const speed =
        (Math.abs(x + y + z - lastX - lastY - lastZ) / diffTime) * 10000;

      if (speed > SHAKE_THRESHOLD) {
        alert('shook!');
      }

      lastX = x;
      lastY = y;
      lastZ = z;
    }
  }

  window.addEventListener('devicemotion', shakeHandler);
}

export default { init };
