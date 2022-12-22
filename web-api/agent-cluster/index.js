/**
 * @since 2022-12-22 19:20
 * @author vivaxy
 */
const button = document.getElementById('button');
const iframe = document.getElementById('iframe');
button.addEventListener('click', function () {
  const sab = new SharedArrayBuffer(1024);
  iframe.contentWindow.postMessage(
    { source: 'agent-cluster', payload: sab },
    '*',
  );
});

window.addEventListener('message', function (e) {
  if ((e.data.source = 'agent-cluster')) {
    console.log('sab', e.data.payload);
  }
});
