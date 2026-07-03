setInterval(() => {
  window.top.postMessage({
    source: 'vivaxy-iframe',
    type: 'heartbeat',
  });
}, 1e3);
