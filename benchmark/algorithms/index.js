/**
 * @since 2024-09-03
 * @author vivaxy
 */
import { findMaxPrime } from './find-max-prime.js';

const algorithms = {
  findMaxPrime() {
    return findMaxPrime(1e12);
  },
};

Object.keys(algorithms).forEach(function (key) {
  const button = document.createElement('button');
  const fnString = algorithms[key].toString();
  const startIndex = 'return ';
  button.textContent = fnString.slice(
    fnString.indexOf(startIndex) + startIndex.length,
    fnString.lastIndexOf(';'),
  );
  document.getElementById('algorithms').appendChild(button);
  button.addEventListener('click', function () {
    const beginTime = performance.now();
    const result = algorithms[key]();
    console.log(
      `${key}`,
      `result=${result}`,
      `cost=${performance.now() - beginTime}ms`,
    );
  });
});
