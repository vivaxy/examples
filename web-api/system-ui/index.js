/**
 * @since 2022-07-14 17:08
 * @author vivaxy
 */
const $container = document.getElementById('container');

document.addEventListener('click', function (e) {
  if (e.target.tagName === 'BUTTON' && e.target.dataset.fontFamily) {
    const fontFamily = e.target.dataset.fontFamily;
    $container.style.fontFamily = fontFamily;
  }
});
