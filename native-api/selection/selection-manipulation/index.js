/**
 * @since 2021-04-01 16:54
 * @author vivaxy
 */
let timer = null;
document.addEventListener('selectionchange', function () {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(function () {
    const focusNode = document.querySelector('p');
    const anchorNode = focusNode.childNodes[0];
    window.getSelection().setBaseAndExtent(anchorNode, 1, anchorNode, 2);
  }, 3000);
});
