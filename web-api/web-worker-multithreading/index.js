/**
 * @since 2024-09-03
 * @author vivaxy
 */
import { findMaxPrime } from '../../benchmark/algorithms/find-max-prime.js';

function bindClick(id, compute) {
  document.getElementById(id).addEventListener('click', async function () {
    const args = document
      .getElementById('tasks')
      .value.split(',')
      .map((v) => Number(v));
    const startTime = performance.now();
    const results = await compute(...args);
    const endTime = performance.now();
    console.log(
      `Run in ${id}, result=${results.join(',')}, cost=${
        endTime - startTime
      }ms`,
    );
  });
}

function getWorkerResponse(number) {
  return new Promise(function (resolve) {
    const worker = new Worker('./worker.js', { type: 'module' });
    worker.addEventListener('message', function (e) {
      resolve(e.data);
      worker.terminate();
    });
    worker.postMessage(number);
  });
}

bindClick('main-thread', function (...args) {
  return args.map((v) => findMaxPrime(v));
});

bindClick('multiple-workers', async function (...args) {
  return Promise.all(args.map((v) => getWorkerResponse(v)));
});
