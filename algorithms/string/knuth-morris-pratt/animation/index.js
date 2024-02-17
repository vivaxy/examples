/**
 * @since 2024-02-04
 * @author vivaxy
 */
import { events } from './utils/events.js';
import { initKMP } from './services/kmp.js';
import { initStage } from './services/stage.js';
import { initPatternTable } from './services/pattern-table.js';
import { initResult } from './services/result.js';
import { initInfo } from './services/info.js';
// import { initDebug } from './services/debug.js';
import { sleep } from './utils/sleep.js';

const kmp = initKMP(events);
initStage(events);
initPatternTable(events);
initResult(events);
initInfo(events);
// initDebug(events);

const url = new URL(location.href);
const text = url.searchParams.get('text') || 'abbbcdefg';
const target = url.searchParams.get('target') || 'bbcd';
const timeout = Number(url.searchParams.get('timeout')) || 300;

const fn = kmp(text, target);
/**
 * @type {{value: *, done?: boolean}}
 */
let result = { value: undefined, done: false };

// // @ts-expect-error window
// window.next = function () {
//   if (!result.done) {
//     result = fn.next();
//   }
// };

while (!result.done) {
  result = fn.next();
  await sleep(timeout);
}
