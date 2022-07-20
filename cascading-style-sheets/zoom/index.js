/**
 * @since 2022-07-20 21:54
 * @author vivaxy
 */
const $test = document.getElementById('test');

function logSize(ele) {
  const { width, height } = ele.getBoundingClientRect();
  console.log('boundingClientRect', { width, height });
  console.log('offsetWidth, offsetHeight', {
    width: ele.offsetWidth,
    height: ele.offsetHeight,
  });
  console.log('clientWidth, clientHeight', {
    width: ele.clientWidth,
    height: ele.clientHeight,
  });
}

document.addEventListener('click', function (e) {
  if (e.target.dataset.styleKey) {
    $test.removeAttribute('style');
    $test.style[e.target.dataset.styleKey] = e.target.dataset.styleValue;
    logSize($test);
    logSize($test.firstElementChild);
  }
});
