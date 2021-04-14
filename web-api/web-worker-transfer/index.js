/**
 * @since 2019-06-20 11:13
 * @author vivaxy
 */

const worker = new Worker('worker.js');

function handleMessageFromWorker(msg) {
  console.log('incoming message from worker, msg:', msg);
}

worker.addEventListener('message', handleMessageFromWorker);

const arrBuf = new ArrayBuffer(8);
console.info('arrBuf.byteLength pre transfer:', arrBuf.byteLength);

worker.postMessage(arrBuf, [arrBuf]);

console.info('arrBuf.byteLength post transfer:', arrBuf.byteLength);
