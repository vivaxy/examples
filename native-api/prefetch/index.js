/**
 * @since 2019-07-17 15:34
 * @author vivaxy
 */
setTimeout(function() {
  const script = document.createElement('script');
  script.src = 'resource.js';
  document.body.appendChild(script);
}, 1000);
