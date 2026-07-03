const nodeIterator = document.createNodeIterator(
  document.body,
  NodeFilter.SHOW_ELEMENT,
  function () {
    return NodeFilter.FILTER_ACCEPT;
  },
);

let currentNode;
while ((currentNode = nodeIterator.nextNode())) {
  // currentNode will be green
  currentNode.style.background = 'rgba(0, 255, 0, 0.3)';
}
