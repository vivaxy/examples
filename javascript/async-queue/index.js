/**
 * @since 2020-04-26 18:52
 * @author vivaxy
 */
const queue = [];

window.addTask = function addTask(args) {
  return new Promise(function(resolve, reject) {
    queue.push(function() {
      return runTask(args).then(resolve, reject);
    });
    loop();
  });
};

function runTask(timeout) {
  return new Promise((resolve) => {
    console.log('start task with timeout: ' + timeout);
    setTimeout(function() {
      console.log('finish task with timeout: ' + timeout);
      resolve();
    }, timeout);
  });
}

async function loop() {
  while (queue.length) {
    await queue.shift()();
  }
}

(async function() {
  await addTask(1000);
  console.log(1000);
  await addTask(2000);
  console.log(2000);
})();
