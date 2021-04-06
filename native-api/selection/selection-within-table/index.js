/**
 * @since 2021-04-06 11:22
 * @author vivaxy
 */
document.addEventListener('selectionchange', function () {
  const sel = window.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
});
