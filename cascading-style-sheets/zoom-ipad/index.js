/**
 * @since 2024-02-29
 * @author vivaxy
 */
const zoomElementSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById('zoom-element')
);
const fontSizeElementSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById('font-size-element')
);
const textSizeAdjustElementSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById('text-size-adjust-element')
);
let zoomElement = null;
let fontSizeElement = null;
let textSizeAdjustElement = getElement(textSizeAdjustElementSelect.value);
let zoomLevel = 1;

document.querySelectorAll('[data-zoom-level]').forEach(function (button) {
  button.addEventListener('click', function () {
    zoomLevel = Number(
      /** @type {HTMLButtonElement} */ (button).dataset.zoomLevel,
    );
    zoomElement.style.zoom = String(zoomLevel);
  });
});

document.getElementById('get-font-size').addEventListener('click', function () {
  const paragraphStyles = window.getComputedStyle(
    document.getElementById('paragraph'),
  );
  console.log({
    'font-size': paragraphStyles.getPropertyValue('font-size'),
  });
});

/**
 * @param {string} elementName
 * @returns {HTMLElement|null}
 */
function getElement(elementName) {
  switch (elementName) {
    case 'html':
      return document.documentElement;
    case 'body':
      return document.body;
    case 'div':
      return document.getElementById('div');
    case 'paragraph':
      return document.getElementById('paragraph');
  }
  return null;
}

/**
 * @param {HTMLElement|null} newZoomElement
 */
function updateZoomElement(newZoomElement) {
  if (zoomElement) {
    zoomElement.style.zoom = 'unset';
  }
  zoomElement = newZoomElement;
  if (zoomElement) {
    // @ts-expect-error zoom
    zoomElement.style.zoom = String(zoomLevel);
  }
}

zoomElementSelect.addEventListener('change', function () {
  updateZoomElement(getElement(zoomElementSelect.value));
});

/**
 * @param {HTMLElement|null} newFontSizeElement
 */
function updateFontSizeElement(newFontSizeElement) {
  if (fontSizeElement) {
    fontSizeElement.style.fontSize = 'unset';
  }
  fontSizeElement = newFontSizeElement;
  if (fontSizeElement) {
    fontSizeElement.style.fontSize = '24px';
  }
}

fontSizeElementSelect.addEventListener('change', function () {
  updateFontSizeElement(getElement(fontSizeElementSelect.value));
});

/**
 * @param {HTMLElement|null} newTextSizeAdjustElement
 */
function updateTextSizeAdjustElement(newTextSizeAdjustElement) {
  if (textSizeAdjustElement) {
    textSizeAdjustElement.style.webkitTextSizeAdjust = 'unset';
  }
  textSizeAdjustElement = newTextSizeAdjustElement;
  if (textSizeAdjustElement) {
    textSizeAdjustElement.style.webkitTextSizeAdjust = 'none';
  }
}

textSizeAdjustElementSelect.addEventListener('change', function () {
  updateTextSizeAdjustElement(getElement(textSizeAdjustElementSelect.value));
});

updateZoomElement(getElement(zoomElementSelect.value));
updateFontSizeElement(getElement(fontSizeElementSelect.value));
updateTextSizeAdjustElement(getElement(textSizeAdjustElementSelect.value));
