/**
 * @since 2018-05-06 12:27:34
 * @author vivaxy
 */

import query from './query.js';

const array = Array.from({ length: query.length }, () => {
  return Math.random() * 0.4 + 0.1;
});

export default array;
