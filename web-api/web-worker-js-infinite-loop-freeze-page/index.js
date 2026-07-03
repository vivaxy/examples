document
  .getElementById('start-infinite-loop')
  .addEventListener('click', function () {
    const worker = new Worker('worker.js');
    worker.postMessage('start-infinite-loop');
  });

setInterval(function () {
  console.log(Date());
}, 1e3);
