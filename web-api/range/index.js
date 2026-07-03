document.addEventListener('selectionchange', function () {
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const {
    collapsed,
    commonAncestorContainer,
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  } = range;
  console.log([
    collapsed,
    commonAncestorContainer,
    startContainer,
    startOffset,
    endContainer,
    endOffset,
  ]);
});
