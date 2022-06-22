/**
 * @since 2022-06-22 16:45
 * @author vivaxy
 */
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function setSelection() {
  const p = document.querySelector('p');
  const selection = window.getSelection();
  const range = document.createRange();
  range.setStartBefore(p.childNodes[0]);
  range.setEndAfter(p.childNodes[0]);
  selection.removeAllRanges();
  selection.addRange(range);
  p.focus();
}

document.addEventListener('click', function (e) {
  setSelection();
  const canvasRect = canvas.getBoundingClientRect();
  const x = e.clientX - canvasRect.x;
  const y = e.clientY - canvasRect.y;
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, 1, 1);
  setSelection();
});

setSelection();
