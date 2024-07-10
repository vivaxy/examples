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
    let exponent = 0;
    let significand = value;
    while (significand >= Number.MAX_SAFE_INTEGER) {
      significand /= 2;
      exponent += 1;
    }
    return (significand + 1) * 2 ** exponent;
  }
  return Infinity;
}
