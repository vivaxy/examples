/**
 * @since 2021-06-21
 * @author vivaxy
 */
import Broadcast from './broadcast.js';

const COUNT = 1000000;

const $message = document.getElementById('message');
const $broadcast = document.getElementById('broadcast');

const broadcast = new Broadcast('sample');
broadcast.on('message', function (msg) {
  document.title = msg;
});

$broadcast.addEventListener('click', function () {
  const startTime = Date.now();
  for (let i = 0; i < COUNT; i++) {
    broadcast.send($message.value);
  }
  const cost = Date.now() - startTime;
  console.log(`${COUNT} times, cost: ${cost}ms`);
});

document.addEventListener('unload', function () {
  broadcast.send('Bye Bye');
  broadcast.destroy();
});
