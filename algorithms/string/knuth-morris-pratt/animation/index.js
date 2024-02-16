/**
 * @since 2024-02-04
 * @author vivaxy
 */
import { events } from './utils/events.js';
import { initKMP } from './services/kmp.js';
import { initStage } from './services/stage.js';
import { initPatternTable } from './services/pattern-table.js';
import { initSearch } from './services/search.js';
import { initInfo } from './services/info.js';
import { sleep } from './utils/sleep.js';

const kmp = initKMP(events);
initStage(events);
initPatternTable(events);
initSearch(events);
initInfo(events);

const fn = kmp('abcdef', 'cd');
/**
 * @type {{value: *, done?: boolean}}
 */
let result = { value: undefined, done: false };
while (!result.done) {
  result = fn.next();
  await sleep(1e3);
}
console.log('result', result);
