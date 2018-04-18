/**
 * @since 20180418 14:36
 * @author vivaxy
 */

import EventEmitter1 from './EventEmitter1.js';
import EventEmitter2 from './EventEmitter2.js';

const startTime1 = Date.now();
for (let i = 0; i < 1e7; i++) {
  const event = new EventEmitter1();
  const callback = (event, data, sender, refer) => {
    console.log(event, data, sender, refer);
  };
  event.on('test', callback);
  event.off('test', callback);
}
console.log(Date.now() - startTime1);

const startTime2 = Date.now();
for (let i = 0; i < 1e7; i++) {
  const event = new EventEmitter2();
  const callback = (event, data, sender, refer) => {
    console.log(event, data, sender, refer);
  };
  const off = event.on('test', callback);
  off();
}
console.log(Date.now() - startTime2);
