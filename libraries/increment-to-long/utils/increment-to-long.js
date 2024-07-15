/**
 * @since 2024-07-10
 * @author vivaxy
 */
const MAX_SAFE_LONG = (2 ** 53 - 1) * 2 ** 10;

/**
 * @param {number} value
 * @return {number}
 */
export function incrementToLong(value) {
  if (value < Number.MAX_SAFE_INTEGER) {
    return value + 1;
  }
  if (value < MAX_SAFE_LONG) {
    const exponent = Math.log(value) / Math.log(2) - 52;
    const significand = value / 2 ** exponent;
    return (significand + 1) * 2 ** exponent;
  }
  return Infinity;
}
