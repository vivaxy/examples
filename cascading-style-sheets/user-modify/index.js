/**
 * @since 2022-10-28 16:24
 * @author vivaxy
 */
const root = document.getElementById('root');
const source = document.getElementById('source');
const target = document.getElementById('target');
root.addEventListener('paste', function (e) {
  console.log('paste', e);
});

root.addEventListener('copy', function () {
  console.log('copy');
  setTimeout(function () {
    setNodeSelection(target);
  }, 1000);
});

setNodeSelection(source);

function setNodeSelection(dom) {
  const selection = window.getSelection();
  const anchorDOM = root;
  const anchorOffset = Array.from(root.childNodes).indexOf(dom);
  const headDOM = root;
  const headOffset = anchorOffset + 1;
  selection.collapse(anchorDOM, anchorOffset);
  selection.extend(headDOM, headOffset);
  console.log(window.getSelection());
}
