/**
 * @since 2021-04-06 11:22
 * @author vivaxy
 */
document.addEventListener('selectionchange', function () {
  const sel = window.getSelection();
  console.log(sel.anchorNode, sel.anchorOffset, sel.focusNode, sel.focusOffset);
});

document
  .querySelector('#select-into-not-contentediable-nodes')
  .addEventListener('click', function () {
    window
      .getSelection()
      .setBaseAndExtent(
        document.querySelector('#content-editable').childNodes[0],
        1,
        document.querySelector('#content-not-editable').childNodes[0],
        2,
      );
  });
