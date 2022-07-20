/**
 * @since 2022-07-20 21:54
 * @author vivaxy
 */
const $test = document.getElementById('test');

document.addEventListener('click', function (e) {
  if (e.target.dataset.styleKey) {
    $test.removeAttribute('style');
    $test.style[e.target.dataset.styleKey] = e.target.dataset.styleValue;
    const { width, height } = $test.getBoundingClientRect();
    console.log('boundingClientRect', { width, height });
    console.log('offsetWidth, offsetHeight', {
      width: $test.offsetWidth,
      height: $test.offsetHeight,
    });
    console.log('clientWidth, clientHeight', {
      width: $test.clientWidth,
      height: $test.clientHeight,
    });
  }
});
