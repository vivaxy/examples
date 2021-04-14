/**
 * @since 2019-08-03 22:12:52
 * @author vivaxy
 */
const lockManager = navigator.locks;
console.log('lockManager', lockManager);

const query = document.querySelector('.js-query');
query.addEventListener('click', async function () {
  const lockManagerSnapshot = await lockManager.query();
  console.log('lockManagerSnapshot', lockManagerSnapshot);
});

const requestExclusive = document.querySelector('.js-request-exclusive');
requestExclusive.addEventListener('click', async function () {
  lockManager.request('vivaxy-samples', async function (lock) {
    console.log('callback start lock', lock);
    await sleep();
    console.log('callback end lock', lock);
  });
});

const requestShared = document.querySelector('.js-request-shared');
requestShared.addEventListener('click', async function () {
  lockManager.request('vivaxy-samples', { mode: 'shared' }, async function (
    lock,
  ) {
    console.log('callback start lock', lock);
    await sleep();
    console.log('callback end lock', lock);
  });
});

const requestIfAvailable = document.querySelector('.js-request-if-available');
requestIfAvailable.addEventListener('click', async function () {
  lockManager.request('vivaxy-samples', { ifAvailable: true }, async function (
    lock,
  ) {
    console.log('callback start lock', lock);
    await sleep();
    console.log('callback end lock', lock);
  });
});

const $countdown = document.querySelector('.js-countdown');

function sleep(timeout = 20e3) {
  return new Promise(function (resolve) {
    const startTime = Date.now();
    let countdown = Math.floor(timeout / 1e3);
    const doCountdown = function () {
      const now = Date.now();
      const cd = Math.floor((timeout + startTime - now) / 1e3);
      if (cd < countdown) {
        countdown = cd;
        $countdown.textContent = String(cd);
      }
      if (cd > 0) {
        requestAnimationFrame(doCountdown);
      }
    };
    requestAnimationFrame(doCountdown);
    setTimeout(resolve, timeout);
  });
}
