/**
 * @since 2016-11-13 18:28
 * @author vivaxy
 */

/**
 * @see https://github.com/xiaokaike/magic-upload-image/blob/master/src/mixin/paste.js
 * @type {Element}
 */
const textarea = document.querySelector('.js-textarea');

function isImage(items) {
  let i = 0;
  let item;
  while (i < items.length) {
    item = items[i];
    if (item.type.indexOf('image') !== -1) {
      return item;
    }
    i++;
  }
  return false;
}

function getFilename(e) {
  let value;
  if (window.clipboardData && window.clipboardData.getData) {
    value = window.clipboardData.getData('Text');
  } else if (e.clipboardData && e.clipboardData.getData) {
    value = e.clipboardData.getData('text/plain');
  }
  value = value.split('\r');
  return value[0];
}

textarea.addEventListener('paste', (e) => {
  const clipboardData = e.clipboardData;
  let image;
  if (clipboardData && clipboardData.items) {
    image = isImage(clipboardData.items);
    if (image) {
      e.preventDefault();
      const file = image.getAsFile();
      file.name = getFilename(e) || 'image-' + Date.now() + '.png';
      console.log(file);
    }
  }
});
