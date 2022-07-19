/**
 * @since 2022-07-19 15:30
 * @author vivaxy
 */
const $button = document.querySelector('#button');
const $container = document.querySelector('#container');

const REQUEST_FULL_SCREEN = 'Request Full Screen';
const EXIT_FULL_SCREEN = 'Exit Full Screen';
$button.textContent = REQUEST_FULL_SCREEN;

$button.addEventListener('click', function (e) {
  if (e.target.textContent === REQUEST_FULL_SCREEN) {
    $container.requestFullscreen();
    e.target.textContent = EXIT_FULL_SCREEN;
  } else {
    document.exitFullscreen();
    e.target.textContent = REQUEST_FULL_SCREEN;
  }
});

const resizeObserver = new ResizeObserver(function () {
  console.log('resizeObserver', $container.getBoundingClientRect());
});
resizeObserver.observe($container);
