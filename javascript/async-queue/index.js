/**
 * @since 2020-04-26 18:52
 * @author vivaxy
 */
import addTask from './async-queue.js';

function sleep(timeout) {
  return new Promise((resolve) => {
    console.log(' start sleep with timeout: ' + timeout);
    setTimeout(function() {
      console.log('finish sleep with timeout: ' + timeout);
      resolve();
    }, timeout);
  });
}

window.addSleepTask = async function addSleepTask(timeout) {
  await addTask(async function() {
    await sleep(timeout);
  });
};

(async function() {
  await addSleepTask(1000);
  console.log(1000);
  await addSleepTask(2000);
  console.log(2000);
})();
