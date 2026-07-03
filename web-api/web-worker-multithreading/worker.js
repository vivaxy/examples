import { findMaxPrime } from '../../benchmark/algorithms/find-max-prime.js';

self.addEventListener('message', function (e) {
  self.postMessage(findMaxPrime(e.data));
});
