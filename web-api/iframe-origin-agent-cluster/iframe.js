import { longTask } from './common.js';

window.addEventListener('message', function onMessage(e) {
  if (e.data === 'do-long-task') {
    longTask();
  }
});
