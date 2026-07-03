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
