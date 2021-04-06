/**
 * @since 2021-04-01 16:54
 * @author vivaxy
 */
function getIndex(node) {
  const SEARCH_TEXT = 'JavaScript';
  const start = node.textContent.indexOf(SEARCH_TEXT);
  const end = start + SEARCH_TEXT.length;
  return [start, end];
}
document.addEventListener('selectionchange', function () {
  setTimeout(function () {
    const focusNode = document.querySelector('#paragraph');
    const anchorNode = focusNode.childNodes[0];
    const [anchorOffset, focusOffset] = getIndex(anchorNode);
    window
      .getSelection()
      .setBaseAndExtent(anchorNode, anchorOffset, anchorNode, focusOffset);
  }, 3000);
});
