/**
 * @since 2018-04-22 09:09:29
 * @author vivaxy
 */

import query from './query.js';
import algorithm from './algorithm.js';
import createAnimation from './animation.js';

let action = 1;

const animation = createAnimation(Array.from({ length: 10 }, (item, index) => {
  action++;
  const element = document.createElement('div');
  element.classList.add('element');
  document.body.appendChild(element);
  return {
    interval: query.interval,
    action,
    element,
  };
}));

window.a = animation;
console.log(query);

