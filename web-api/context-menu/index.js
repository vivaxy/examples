/**
 * @since 2022-03-22
 * @author vivaxy
 */
[
  document.querySelector('textarea'),
  document.querySelector('input'),
  document.querySelector('div[contenteditable="true"]'),
].forEach(function (element) {
  element.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    const selection = window.getSelection();
    console.log(selection);
  });
});
