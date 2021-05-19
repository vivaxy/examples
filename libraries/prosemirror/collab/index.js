/**
 * @since 2021-05-19
 * @author vivaxy
 */
import * as source from './js/source.js';
import * as replica from './js/replica.js';

const isSource = !window.opener;

if (isSource) {
  source.init();
} else {
  replica.init();
}
