/**
 * @since 150628 13:18
 * @author vivaxy
 */
let startTime;
const rotateElement = document.querySelector('.rotate');

function rotate(timestamp) {
  if (!startTime) {
    startTime = timestamp;
  }
  const timeLapsed = timestamp - startTime;
  const speed = 10000; // rotate 360 degree in 10 seconds
  const degree = (timeLapsed / speed) * 360;
  rotateElement.style.transform = `rotate(${degree}deg)`;
  requestAnimationFrame(rotate);
}

rotate();
