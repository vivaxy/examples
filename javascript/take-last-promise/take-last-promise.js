/**
 * @since 2019-12-21 09:22
 * @author vivaxy
 */
export default function takeLastPromise(fn) {
  let lastResolve = null;
  let lastReject = null;
  return function taskLastPromiseRunner(...args) {
    return new Promise(function(resolve, reject) {
      lastResolve = resolve;
      lastReject = reject;
      fn(...args)
        .then(function(result) {
          if (lastResolve === resolve) {
            lastResolve(result);
          }
        })
        .catch(function(error) {
          if (lastReject === reject) {
            lastReject(error);
          }
        });
    });
  };
}
