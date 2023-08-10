/**
 * @since 2023-08-10
 * @author vivaxy
 */
setInterval(() => {
  window.top.postMessage({
    source: 'vivaxy-iframe',
    type: 'heartbeat',
  });
}, 1e3);

document.addEventListener('frozen', function () {
  console.log('frozen');
});

document.addEventListener('resume', function () {
  console.log('resume');
});
