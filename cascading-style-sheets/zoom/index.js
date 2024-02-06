/**
 * @since 2022-07-20 21:54
 * @author vivaxy
 */
const $test = document.getElementById('test');

/**
 * @param {string} name
 * @param {HTMLElement} ele
 */
function logSize(name, ele) {
  const { width, height, left, top } = ele.getBoundingClientRect();
  console.log(
    name,
    'boundingClientRect',
    { width, height, left, top },
    'offset',
    {
      width: ele.offsetWidth,
      height: ele.offsetHeight,
      left: ele.offsetLeft,
      top: ele.offsetTop,
    },
    'client',
    {
      width: ele.clientWidth,
      height: ele.clientHeight,
      left: ele.clientLeft,
      top: ele.clientTop,
    },
  );
}

document.addEventListener('click', function (e) {
  if (/** @type {HTMLElement} */ (e.target).dataset.styleKey) {
    const { styleKey, styleValue } = /** @type {HTMLElement} */ (e.target)
      .dataset;
    $test.removeAttribute('style');
    $test.style[styleKey] = styleValue;
    logSize('node', $test);
    // logSize('child', /** @type {HTMLElement} */ ($test.children[0]));
  } else if (/** @type {HTMLElement} */ (e.target).textContent === 'Reset') {
    $test.removeAttribute('style');
    logSize('node', $test);
    // logSize('child', /** @type {HTMLElement} */ ($test.children[0]));
  }
});

logSize('node', $test);
