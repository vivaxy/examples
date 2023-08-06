/**
 * @since 2023-08-07
 * @author vivaxy
 */
import { draw } from './draw-canvas.js';
/**
 * @param points
 * @param {BigInt} x
 * @param {BigInt} y
 * @returns {boolean}
 */
function findInPoints(points, x, y) {
  for (const [_x, _y] of points) {
    if (_x === Number(x) && _y === Number(y)) {
      return true;
    }
  }
  return false;
}

function checkMatch(fn, points, minX, xLength, minY, yLength) {
  for (let x = 0n; x <= xLength; x = x + 1n) {
    for (let y = 0n; y <= yLength; y = y + 1n) {
      const result = fn(x + minX, y + minY);
      const found = findInPoints(points, x, y);
      if (result !== found) {
        return false;
      }
    }
  }
  return true;
}

export function findMinY(fn, points, xLength, yLength) {
  for (let minY = 0n; ; minY = minY + 1n) {
    const match = checkMatch(fn, points, 0n, xLength, minY, yLength);
    if (match) {
      draw(fn, 0n, xLength, minY, yLength);
      return minY;
    }
  }
}
