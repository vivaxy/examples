/**
 * @since 2021-06-22
 * @author vivaxy
 */
import {
  BroadcastChannel,
  createLeaderElection,
} from 'https://unpkg.com/broadcast-channel?module';

const channel = new BroadcastChannel('sample', options);
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

window.addEventListener('beforeunload', async function () {
  alert(1);
  channel.postMessage('Bye Bye');
  await channel.channel();
});
