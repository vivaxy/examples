/**
 * @since 2021-04-06 20:28
 * @author vivaxy
 */
[
  'click',
  'touchstart',
  'touchmove',
  'touchend',
  'touchcancel',
  'mousedown',
  'mouseup',
].map(function (event) {
  document.addEventListener(event, function (e) {
    console.log(event, e);
  });
});
