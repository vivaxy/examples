/**
 * @since 2019-06-20 11:13
 * @author vivaxy
 */

self.onmessage = function(msg) {
  console.log('incoming message from invoker, msg:', msg);
  sendWorkerArrBuff(msg.data);
};

function sendWorkerArrBuff(data) {
  console.info('from worker, pre send back data.byteLength:', data.byteLength);

  setTimeout(() => {
    self.postMessage(data, [data]);

    console.info('from worker, post send back data.byteLength:', data.byteLength);
  }, 1000);
}
