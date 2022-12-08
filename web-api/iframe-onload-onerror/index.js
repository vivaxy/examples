/**
 * @since 2022-12-08 03:40
 * @author vivaxy
 */
function createIframe(src, onLoad, onError) {
  const iframe = document.createElement('iframe');
  iframe.addEventListener('load', function (e) {
    console.log('load', e);
  });
  iframe.addEventListener('error', function (e) {
    console.log('error', e);
  });
  iframe.src = src;
}

createIframe('/index.html');
