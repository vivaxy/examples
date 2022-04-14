/**
 * @since 2022-04-14 10:33
 * @author vivaxy
 */
import { run } from 'https://unpkg.com/@vivaxy/framework/utils/benchmark';

const test1 = document.getElementById('test1');
const test2 = document.getElementById('test2');

const cost1 = await run(function () {
  const rect1 = test1.getBoundingClientRect();
  const rect2 = test2.getBoundingClientRect();
}, {});

const cost2 = await run(function () {
  const rect1 = test1.getBoundingClientRect();
}, {});

console.log('2 getBoundingClientRect', cost1, '1 getBoundingClientRect', cost2);
