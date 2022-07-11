/**
 * @since 2022-07-11 19:34
 * @author vivaxy
 */
const $scroll = document.getElementById('scroll');
const $move = document.getElementById('move');
$move.addEventListener('click', function () {
  const $wrapper = document.createElement('div');
  document.body.appendChild($wrapper);
  $wrapper.appendChild($scroll);
});
