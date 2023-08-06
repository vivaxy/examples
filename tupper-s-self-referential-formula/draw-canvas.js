/**
 * @since 2023-08-07
 * @author vivaxy
 */
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'black';

/**
 * @param {BigNumber} x
 * @param {BigNumber} y
 * @returns {[number, number, number, number]}
 */
function cartesianCoordinateToCanvasCoordinate(x, y) {
  const pointToPx = 10;
  // 1 point as 10px;
  // flip y-axis;
  // 0, 0 => 0, 10 * (Math.floor(canvas.height / 10) - 1)
  return [
    Number(x) * pointToPx,
    pointToPx * (Math.floor(canvas.height / pointToPx) - 1 - Number(y)),
    pointToPx,
    pointToPx,
  ];
}

export function draw(fn, minX, xLength, minY, yLength) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let x = 0n; x <= xLength; x = x + 1n) {
    for (let y = 0n; y <= yLength; y = y + 1n) {
      const result = fn(x + minX, y + minY);
      console.log(x + minX, y + minY, result);
      if (result) {
        const canvasCoordinates = cartesianCoordinateToCanvasCoordinate(x, y);
        ctx.fillRect(...canvasCoordinates);
      }
    }
  }
}
