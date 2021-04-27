const samples = {
  insertNode,
  wrapStart,
  removeStart,
  removeBeforeStart,
  moveSelection,
};

function insertNode(range) {
  const { startContainer, endContainer, startOffset, endOffset } = range;
  if (
    startContainer === endContainer &&
    startContainer.nodeType === Node.TEXT_NODE
  ) {
    startContainer.splitText(Math.floor((startOffset + endOffset) / 2));
    const leftNode = startContainer;
    const rightNode = startContainer.nextSibling;
    const span = document.createElement('span');
    span.innerHTML = '❌';
    rightNode.parentNode.insertBefore(span, rightNode);
  }
}

function wrapStart(range) {
  const { startContainer, startOffset } = range;
  if (
    startContainer.nodeType === Node.TEXT_NODE &&
    startOffset > 0 &&
    startOffset < startContainer.textContent.length - 1
  ) {
    const leftNode = startContainer.splitText(startOffset - 1);
    const middleNode = startContainer.nextSibling;
    middleNode.splitText(2);
    const rightNode = middleNode.nextSibling;

    const wrapper = document.createElement('span');
    wrapper.style.background = 'rgba(255, 255, 0, 1)';
    wrapper.appendChild(middleNode);
    rightNode.parentNode.insertBefore(wrapper, rightNode);
  }
}

function removeStart(range) {
  const { startContainer, startOffset } = range;
  if (
    startContainer.nodeType === Node.TEXT_NODE &&
    startOffset < startContainer.textContent.length - 1
  ) {
    startContainer.splitText(startOffset);
    startContainer.nextSibling.splitText(1);
    startContainer.nextSibling.remove();
    startContainer.parentNode.normalize();
  }
}

function removeBeforeStart(range) {
  const { startContainer, startOffset } = range;
  if (startContainer.nodeType === Node.TEXT_NODE && startOffset > 0) {
    startContainer.splitText(startOffset);
    const remainingNode = startContainer.nextSibling;
    if (startOffset > 1) {
      startContainer.splitText(startOffset - 1);
      startContainer.nextSibling.remove();
    } else {
      startContainer.remove();
    }
    remainingNode.parentNode.normalize();
  }
}

function moveSelection(range) {
  const { startContainer, startOffset, endContainer, endOffset } = range;
  if (
    startContainer === endContainer &&
    startContainer.nodeType === Node.TEXT_NODE
  ) {
    startContainer.splitText(endOffset);
    startContainer.splitText(startOffset);
    startContainer.parentNode.insertBefore(
      startContainer.nextSibling.nextSibling,
      startContainer.nextSibling,
    );
    startContainer.parentNode.normalize();
  }
}

function getParentId(node) {
  let curNode = node;
  while (curNode && (!curNode.hasAttribute || !curNode.hasAttribute('id'))) {
    curNode = curNode.parentNode;
  }
  return curNode.getAttribute('id');
}

document.addEventListener('mouseup', function () {
  const range = window.getSelection().getRangeAt(0);
  if (!range || range.collapsed) {
    return;
  }
  const sample = getParentId(range.commonAncestorContainer);
  if (samples[sample]) {
    samples[sample](range);
  }
});
