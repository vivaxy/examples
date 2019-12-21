/**
 * @since 2019-12-21 09:06
 * @author vivaxy
 */
import takeLastPromise from './take-last-promise.js';

function sleep(timeout) {
  return new Promise(function(resolve) {
    setTimeout(resolve, timeout);
  });
}

const logOnLastSleep = takeLastPromise(sleep);

Array.from(document.querySelectorAll('button')).forEach(function(button) {
  button.addEventListener('click', async function(e) {
    const timeout = Number(e.target.dataset.timeout);
    await logOnLastSleep(timeout);
    console.log('sleep ' + timeout + ' end');
  });
});
