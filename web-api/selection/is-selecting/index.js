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
  'focus',
  'blur',
].forEach(function (event) {
  document.querySelector('#editor').addEventListener(event, function (e) {
    console.log(event, e);
  });
});

['selectionchange'].forEach(function (event) {
  document.addEventListener(event, function (e) {
    console.log(event, e);
  });
});
