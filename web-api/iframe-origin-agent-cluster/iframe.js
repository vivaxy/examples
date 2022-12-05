/**
 * @since 2022-12-05 16:58
 * @author vivaxy
 */
import { longTask } from './common.js';

window.addEventListener('message', function onMessage(e) {
  if (e.data === 'do-long-task') {
    longTask();
  }
});
