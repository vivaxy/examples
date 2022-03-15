/**
 * @since 2021-06-22
 * @author vivaxy
 */
import {
  BroadcastChannel,
  createLeaderElection,
} from 'https://cdn.skypack.dev/broadcast-channel';

const channel = new BroadcastChannel('sample');
const elector = createLeaderElection(channel);

const $message = document.getElementById('message');
const $broadcast = document.getElementById('broadcast');

elector.awaitLeadership().then(() => {
  console.log('this tab is now leader');
});

channel.onmessage = (msg) => {
  document.title = msg;
};

elector.onduplicate = () => {
  alert('have duplicate leaders!');
};

$broadcast.addEventListener('click', function () {
  channel.postMessage($message.value);
});

window.addEventListener('unload', async function () {
  alert('closing');
  channel.postMessage('Bye Bye');
  await channel.channel();
});
