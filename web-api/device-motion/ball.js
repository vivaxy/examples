/**
 * @since 20180525 16:23
 * @author vivaxy
 */

function init() {
  const ball = document.createElement('div');
  ball.style.width = '30px';
  ball.style.height = '30px';
  ball.style.backgroundColor = '#f00';
  ball.style.borderRadius = '50%';
  ball.style.position = 'absolute';
  ball.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
  ball.style.transform = 'translate3d(-50%, -50%, 0)';
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let x = targetX;
  let y = targetY;
  let ax = 0;
  let ay = 0;
  let vx = 0;
  let vy = 0;
  let xDiff = 0;
  let yDiff = 0;
  const iphone6sM = 12820; // px
  let now = Date.now();

  document.body.appendChild(ball);
  window.addEventListener('devicemotion', handleDeviceMotion);
  requestAnimationFrame(update);

  function handleDeviceMotion(e) {
    const acceleration = e.acceleration;
    const rotationRate = e.rotationRate;
    const newNow = Date.now();
    const interval = newNow - now;
    now = newNow;

    ax = acceleration.x;
    ay = acceleration.y;
    vx += (ax * interval) / 1000; // m/s
    vy += (ay * interval) / 1000;
    targetX += ((vx * interval) / 1000) * iphone6sM;
    targetY -= ((vy * interval) / 1000) * iphone6sM;
  }

  function update() {
    xDiff = (targetX - x) / 2;
    yDiff = (targetY - y) / 2;
    x += xDiff;
    y += yDiff;
    ball.style.left = x + 'px';
    ball.style.top = y + 'px';
    requestAnimationFrame(update);
  }
}

export default { init };
