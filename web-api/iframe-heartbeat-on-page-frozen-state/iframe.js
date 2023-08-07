/**
 * @since 2023-08-07
 * @author vivaxy
 */
setInterval(() => {
  window.top.postMessage({
    source: 'vivaxy-iframe',
    type: 'heartbeat',
  });
}, 1e3);
