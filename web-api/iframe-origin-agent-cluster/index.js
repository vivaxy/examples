/**
 * @since 2022-12-05 16:57
 * @author vivaxy
 */
import { longTask } from './common.js';

const iframe = document.getElementById('iframe');
const button = document.getElementById('button');

button.addEventListener('click', function () {
  iframe.contentWindow.postMessage('do-long-task', '*');
  setTimeout(longTask);
});
