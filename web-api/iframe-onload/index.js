/**
 * @since 2022-12-08 03:40
 * @author vivaxy
 */
function createIframe(src, onLoad, onError) {
  const startTime = performance.now();
  const iframe = document.createElement('iframe');
  iframe.addEventListener('load', function (e) {
    const cost = performance.now() - startTime;
    console.log('load', src, e, `cost ${cost}`);
  });
  iframe.addEventListener('error', function (e) {
    console.log('error', src, e);
  });
  iframe.src = src;
  document.body.appendChild(iframe);
}

createIframe('//localhost:3456/iframe.html');
createIframe('//localhost:3456/error.html');
