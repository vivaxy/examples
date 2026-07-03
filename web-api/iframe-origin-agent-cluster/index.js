import { longTask } from './common.js';

const iframe = document.getElementById('iframe');
const button = document.getElementById('button');

button.addEventListener('click', function () {
  iframe.contentWindow.postMessage('do-long-task', '*');
  setTimeout(longTask);
});
