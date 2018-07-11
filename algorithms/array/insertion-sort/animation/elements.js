/**
 * @since 2018-05-06 12:41:50
 * @author vivaxy
 */

import query from './query.js';
import array from './array.js';

const body = document.body;

export default array.map((item, index) => {
  const ele = document.createElement('div');
  ele.classList.add('item');
  ele.style.height = (item * 100) + '%';
  ele.style.width = (100 / query.length) + '%';
  ele.style.left = (100 / query.length * index) + '%';
  ele.style.transition = `all ${query.interval}ms`;
  ele.style.animationDuration = `${query.interval}ms`;
  ele.setAttribute('data-index', String(index));
  ele.setAttribute('data-value', String(item));
  body.appendChild(ele);
  return ele;
});
