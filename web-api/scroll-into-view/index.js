/**
 * @since 2020-05-22 15:43
 * @author vivaxy
 */
const $target = document.getElementById('target');
const $container = document.getElementById('container');
const $scroll = document.getElementById('scroll');

$scroll.addEventListener('click', function () {
  $target.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  });
});
