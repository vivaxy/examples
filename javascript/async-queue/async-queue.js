/**
 * @since 2020-04-26 20:31
 * @author vivaxy
 */
const queue = [];
let taskIsRunning = false;

export default function addTask(fn) {
  return new Promise(function(resolve, reject) {
    queue.push(function() {
      return fn().then(resolve, reject);
    });
    loop();
  });
}

async function loop() {
  while (queue.length && !taskIsRunning) {
    taskIsRunning = true;
    await queue.shift()();
    taskIsRunning = false;
  }
}
