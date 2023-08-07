/**
 * @since 2023-08-07
 * @author vivaxy
 */
// import { findMinY } from '../find-min-y.js';

/**
 * @param {BigInt} x
 * @param {BigInt} y
 * @returns {boolean}
 */
export function formula(x, y) {
  const left = new BigNumber(1 / 2);
  const right2Exp = new BigNumber(-3)
    .multipliedBy(new BigNumber(x).toFixed(0, BigNumber.ROUND_FLOOR))
    .minus(new BigNumber(new BigNumber(y).toFixed()).modulo(3));
  const right1 = new BigNumber(
    new BigNumber(y).dividedBy(3).toFixed(0, BigNumber.ROUND_FLOOR),
  );
  const right2 = new BigNumber(2).exponentiatedBy(right2Exp);
  const right = new BigNumber(right1.multipliedBy(right2))
    .modulo(2)
    .toFixed(0, BigNumber.ROUND_FLOOR);
  return left.isLessThan(right);
}

export const points = [
  [0, 0],
  [0, 2],
  [1, 1],
  [2, 0],
  [2, 2],
  [4, 2],
  [5, 0],
  [5, 1],
  [6, 2],
];

export const minX = 0n;
export const xLength = 6n;
export const minY = 1389223n;
export const yLength = 2n;

// console.log('found minY', findMinY(formula, points, xLength, yLength));
