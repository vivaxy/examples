/**
 * @since 2018-04-22 09:09:29
 * @author vivaxy
 */

import query from './query.js';
import algorithm from './algorithm.js';
import createAnimation from './animation.js';

const createArray = (length) => {
  return Array.from({ length }).map((item, index) => {
    return Math.random();
  });
};

const array = createArray(query.length);
const elementArray = array.map((item, index) => {
  const element = document.createElement('div');
  element.classList.add('item');
  element.style.height = (item * 100) + '%';
  element.style.width = (100 / query.length) + '%';
  element.style.left = (100 / query.length * index) + '%';
  element.style.transition = `all ${query.interval}ms`;
  element.style.animationDuration = `${query.interval}ms`;
  element.setAttribute('data-index', index);
  element.setAttribute('data-value', item);
  return element;
});

const steps = algorithm(array, array.length);
const animations = createAnimation(steps, query.interval);

elementArray.map((element) => {
  document.body.appendChild(element);
});

animations.start();
// window.animations = animations;
