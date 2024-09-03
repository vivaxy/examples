/**
 * @since 2024-09-03
 * @author vivaxy
 */
import { findMaxPrime } from '../../benchmark/algorithms/find-max-prime.js';

self.addEventListener('message', function (e) {
  self.postMessage(findMaxPrime(e.data));
});
