/**
 * @since 2023-08-29
 * @author vivaxy
 */
function appendIframe(src) {
  const iframe = document.createElement('iframe');
  iframe.src = src;
  document.body.appendChild(iframe);
}

document.addEventListener('click', function (e) {
  if (e.target.tagName === 'BUTTON') {
    if (e.target.dataset.withOriginAgentCluster) {
      appendIframe('//localhost:3457/iframe.html');
    } else {
      appendIframe('/iframe.html');
    }
  }
});

setInterval(function () {
  console.log(Date());
}, 1e3);
