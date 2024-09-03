/**
 * @since 2024-09-03
 * @author vivaxy
 */
/**
 * @param {number} num
 * @return {boolean}
 */
function isPrime(num) {
  if (num <= 1) {
    return false;
  }
  if (num === 2) {
    return true;
  }
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

/**
 * @param {number} target
 * @return {number}
 */
export function findMaxPrime(target) {
  for (let i = target; i > 0; i--) {
    if (isPrime(i)) {
      return i;
    }
  }
  return -1;
}
