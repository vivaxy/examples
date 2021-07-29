/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { StepMap } from 'prosemirror-transform';

// 0 1 2 3 4  0 1 2 3 4
//  A B C D => A X B D
const stepMap = new StepMap([1, 0, 1, 2, 1, 0]);
console.log('new StepMap([1, 0, 1, 2, 1, 0])', stepMap);

stepMap.forEach(function (oldStart, oldEnd, newStart, newEnd) {
  console.log('forEach', oldStart, oldEnd, newStart, newEnd);
});

console.log('stepMap.invert()', stepMap.invert());
console.log('StepMap.offset(1)', StepMap.offset(1));
