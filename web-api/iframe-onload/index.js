/**
 * @since 2022-12-08 03:40
 * @author vivaxy
 */
function createIframe(src) {
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

function updateSrc(iframe, newSrc) {
  iframe.src = newSrc;
}

function onClick(id, handler) {
  document.getElementById(id).addEventListener('click', handler);
}

onClick('load-valid-iframe', function () {
  createIframe('//127.0.0.1:3457/iframe.html');
});
onClick('load-invalid-iframe', function () {
  createIframe('//127.0.0.1:3457/error.html');
});
onClick('update-iframe-src', function () {
  updateSrc(document.querySelector('iframe'), '//127.0.0.1:3456/iframe.html');
});
