/**
 * @since 2019-07-09 08:40:24
 * @author vivaxy
 */

function loadScript(url) {
  return new Promise(function(reslove, reject) {
    const script = document.createElement('script');
    script.src = url;
    // script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
    // script.addEventListener('load', reslove);
    // script.addEventListener('error', reject);
    reject(new Error('my error'));
  });
}

window.addEventListener('error', function(err) {
  console.log('error' + err.stack);
  alert('error ' + err.stack);
});

window.addEventListener('unhandledrejection', function(err) {
  console.log('unhandledrejection ' + err.reason);
  alert('unhandledrejection ' + err.reason);
});

(async function() {
  await loadScript('http://192.168.0.105:3002/script1.js');
})();
