/**
 * @since 2022-07-07 17:21
 * @author vivaxy
 */
const $background = document.getElementById('background');
const $foreground = document.getElementById('foreground');

$background.addEventListener('click', function () {
  console.log('background clicked');
});

$foreground.addEventListener('pointerup', function () {
  console.log('foreground pointerup');
  $foreground.style.display = 'none';
  setTimeout(() => {
    $foreground.style.display = 'block';
  }, 3e3);
});
