/**
 * @since 2021-04-19
 * @author vivaxy
 */
const ul = document.querySelector('ul');
document.addEventListener('selectionchange', function (e) {
  const sel = window.getSelection();
  if (sel.anchorNode && sel.anchorNode.parentNode.tagName === 'LI') {
    Array.from(ul.querySelectorAll('li')).forEach(function (li) {
      if (li === sel.anchorNode.parentNode) {
        li.style.userSelect = 'text';
      }
    });
    ul.style.userSelect = 'none';
  }
});
document.addEventListener('mouseup', function () {
  setTimeout(function () {
    Array.from(ul.querySelectorAll('li')).forEach(function (li) {
      li.style.userSelect = '';
    });
    ul.style.userSelect = 'auto';
  }, 1000);
});
