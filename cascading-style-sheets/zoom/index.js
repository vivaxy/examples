/**
 * @since 2022-07-20 21:54
 * @author vivaxy
 */
const $test = /** @type {HTMLDivElement} */ (document.querySelector('.node'));
const $viewportMeta = document.querySelector('meta[name="viewport"]');

/**
 * @param {number} scale
 */
function setViewportScale(scale) {
  // @ts-expect-error content not in element
  $viewportMeta.content = `width=device-width, initial-scale=${scale}, maximum-scale=${scale}, user-scalable=0`;
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
  const target = /** @type {HTMLElement} */ (e.target);
  const styleKey = target.dataset.styleKey;
  if (styleKey && handlers[styleKey]) {
    reset();
    handlers[styleKey]();
  } else if (target.classList.contains('point')) {
    const rect = target.getBoundingClientRect();
    console.log(
      'event',
      { x: e.clientX, y: e.clientY },
      'boundingClientRect',
      {
        x: rect.x + rect.width / 2,
        y: rect.y + +rect.height / 2,
      },
      'offset',
      { x: target.offsetLeft, y: target.offsetTop },
    );
  }
});
