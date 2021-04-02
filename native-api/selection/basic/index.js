function logSelection() {
  const selection = window.getSelection();
  const {
    type,
    isCollapsed,
    rangeCount,
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  } = selection;
  console.log([
    type,
    isCollapsed,
    rangeCount,
    anchorNode,
    anchorOffset,
    focusNode,
    focusOffset,
  ]);
}
document.addEventListener('selectionchange', logSelection);
logSelection();
