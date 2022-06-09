/**
 * @since 2022-06-03 23:07
 * @author vivaxy
 */
const $container = document.querySelector('#container');
const $anchor = document.querySelector('#anchor');

$anchor.scrollIntoView();

let newNodeIndex = 0;
function createNewNode() {
  const p = document.createElement('p');
  p.className = 'new';
  p.innerHTML = 'New node ' + newNodeIndex++;
  return p;
}

document.getElementById('before').addEventListener('click', function () {
  const p = createNewNode();
  $container.insertBefore(p, $anchor);
});

document.getElementById('after').addEventListener('click', function () {
  const p = createNewNode();
  $container.insertBefore(p, $anchor.nextSibling);
});
