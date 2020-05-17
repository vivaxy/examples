/**
 * @since 2020-02-06 12:05
 * @author vivaxy
 */
const $switchSizeButton = document.getElementById('switch-size');
const $container = document.querySelector('.container');
const $iframe0 = document.querySelectorAll('iframe')[0];
const $iframe1 = document.querySelectorAll('iframe')[1];

[$iframe0, $iframe1].forEach(function($iframe, index) {
  $iframe.contentDocument.defaultView.addEventListener('resize', function(e) {
    console.log('resize', index);
  });
});

$switchSizeButton.addEventListener('click', function() {
  $container.style.width = $container.style.width === '50%' ? '100%' : '50%';
});
