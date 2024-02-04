/**
 * @since 2024-02-04
 * @author vivaxy
 */
import { events } from './utils/events.js';
import { initKMP } from './services/kmp.js';
import { initStage } from './services/stage.js';
import { initPatternTable } from './services/pattern-table.js';

const kmp = initKMP(events);
initStage(events);
initPatternTable(events);

const fn = kmp('abcd', 'c');
/**
 * @type {{value: *, done?: boolean}}
 */
let result = { value: undefined, done: false };
while (!result.done) {
  result = fn.next();
}
console.log('result', result);
