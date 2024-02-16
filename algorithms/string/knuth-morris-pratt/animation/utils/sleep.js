/**
 * @since 2024-02-16
 * @author vivaxy
 */
/**
 * @param {number} timeout
 * @returns {Promise<void>}
 */
export function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}
