/**
 * @since 2020-08-05 11:17
 * @author vivaxy
 */
function initializeDOM(totalDepth) {
  const root = document.createElement('div');
  root.setAttribute('data-depth', 0);
  let parent = root;
  let depth = totalDepth - 1;
  while (depth > 0) {
    const dom = document.createElement('div');
    dom.setAttribute('data-depth', totalDepth - depth);
    parent.appendChild(dom);
    parent = dom;
    depth--;
  }
  document.body.appendChild(root);
}

function walkThrouthDOMTree(from) {
  let current = from;
  let data = [];
  while (current && current !== document.body) {
    data.push(Number(current.dataset.depth));
    current = current.parentNode;
  }
  return data;
}

document.querySelector('button').addEventListener('click', function() {
  const depth = Number(document.querySelector('input').value);
  initializeDOM(depth);
  const startTime = Date.now();
  walkThrouthDOMTree(document.querySelector(`[data-depth="${depth - 1}"]`));
  const endTime = Date.now();
  console.log(`Cost ${endTime - startTime}ms`);
  document.body.removeChild(document.querySelector(`[data-depth="0"]`));
});
