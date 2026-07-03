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
