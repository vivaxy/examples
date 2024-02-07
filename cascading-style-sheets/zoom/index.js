/**
 * @since 2022-07-20 21:54
 * @author vivaxy
 */
const $test = document.getElementById('test');
const $viewportMeta = document.querySelector('meta[name="viewport"]');

/**
 * @param {number} scale
 */
function setViewportScale(scale) {
  // @ts-expect-error content not in element
  $viewportMeta.content = `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0`;
}

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

function reset() {
  $test.removeAttribute('style');
  setViewportScale(1);
}

const handlers = {
  reset() {},
  zoom() {
    // @ts-expect-error zoom not in style
    $test.style.zoom = '2';
  },
  scale() {
    $test.style.transform = 'scale(2)';
  },
  viewport() {
    setViewportScale(2);
  },
};

document.addEventListener('click', function (e) {
  const styleKey = /** @type {HTMLElement} */ (e.target).dataset.styleKey;
  if (styleKey && handlers[styleKey]) {
    reset();
    handlers[styleKey]();
    logSize('node', $test);
  } else {
    console.log('document client event client', { x: e.clientX, y: e.clientY });
  }
});

logSize('node', $test);
$test.addEventListener('click', function (e) {
  console.log('node client event client', { x: e.clientX, y: e.clientY });
});
