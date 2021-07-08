/**
 * @since 2021-07-08
 * @author vivaxy
 */
export function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}
