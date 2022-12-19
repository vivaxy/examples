/**
 * @since 2022-12-05 16:58
 * @author vivaxy
 */
window.addEventListener('message', function onMessage(e) {
  if (e.data.type === 'request') {
    window.parent.postMessage(
      {
        type: 'response',
        data: e.data.data,
      },
      '*',
    );
  }
});
