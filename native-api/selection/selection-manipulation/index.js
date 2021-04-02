/**
 * @since 2021-04-01 16:54
 * @author vivaxy
 */
document.addEventListener('selectionchange', function () {
  setTimeout(function () {
    const focusNode = document.querySelector('p');
    const anchorNode = focusNode.childNodes[0];
    window.getSelection().setBaseAndExtent(anchorNode, 1, anchorNode, 2);
  }, 3000);
});
