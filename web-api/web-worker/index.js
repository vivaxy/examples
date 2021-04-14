/**
 * @since 2014/8/28 17:24
 * @author vivaxy
 */
// web worker 1
const button1 = document.getElementsByClassName('button1')[0];
const output1 = document.getElementsByClassName('output1')[0];
let worker1 = undefined;
const startWebWorker1 = function () {
  if (worker1 === undefined) {
    worker1 = new Worker('worker1.js');
    worker1.addEventListener('message', showResult1, false);
    button1.innerHTML = 'stop web worker';
    button1.removeEventListener('click', startWebWorker1, false);
    button1.addEventListener('click', stopWebWorker1, false);
  }
};
const stopWebWorker1 = function () {
  if (worker1 === undefined) return;
  worker1.terminate();
  worker1.removeEventListener('message', showResult1, false);
  worker1 = undefined;
  button1.innerHTML = 'start web worker';
  button1.removeEventListener('click', stopWebWorker1, false);
  button1.addEventListener('click', startWebWorker1, false);
  output1.innerHTML = '';
};
const showResult1 = function (e) {
  const data = JSON.parse(e.data);
  output1.innerHTML = data.timedCount;
};
button1.addEventListener('click', startWebWorker1, false);

// web worker 2
const button2 = document.getElementsByClassName('button2')[0];
const output2 = document.getElementsByClassName('output2')[0];
const worker2 = new Worker('worker2.js');
button2.addEventListener(
  'click',
  function () {
    worker2.postMessage('test');
  },
  false,
);
worker2.addEventListener(
  'message',
  function (e) {
    output2.innerHTML = e.data + ' web worker2 closed!';
  },
  false,
);
