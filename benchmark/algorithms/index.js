/**
 * @since 2024-09-03
 * @author vivaxy
 */
/**
 * @param {number} num
 * @return {boolean}
 */
function isPrime(num) {
  if (num <= 1) {
    return false;
  }
  if (num === 2) {
    return true;
  }
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}

/**
 * @param {number} target
 * @return {number}
 */
function findMaxPrime(target) {
  for (let i = target; i > 0; i--) {
    if (isPrime(i)) {
      return i;
    }
  }
  return -1;
}

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
