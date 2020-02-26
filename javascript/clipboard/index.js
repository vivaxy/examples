/**
 * @since 2016-11-13 18:28
 * @author vivaxy
 */

/**
 * @see https://github.com/xiaokaike/magic-upload-image/blob/master/src/mixin/paste.js
 * @type {Element}
 */
const textarea = document.querySelector('.js-textarea');
const html = document.querySelector('.js-html');

function getImage(items) {
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
  html.innerHTML = '';
  const clipboardData = e.clipboardData;
  if (clipboardData && clipboardData.items) {
    const image = getImage(clipboardData.items);
    if (image) {
      console.log('Paste: Image');
      e.preventDefault();
      const file = image.getAsFile();
      file.name = getFilename(e) || 'image-' + Date.now() + '.png';
      const objectURL = URL.createObjectURL(file);
      html.innerHTML = `<img src="${objectURL}">`;
      return;
    }

    for (const item of clipboardData.items) {
      if (item.kind === 'string' && item.type === 'text/plain') {
        console.log('Paste: Plain Text');
        // This item is the target node
        item.getAsString(function(s) {
          html.innerHTML = s;
        });
      } else if (item.kind === 'string' && item.type === 'text/html') {
        // Drag data item is HTML
        console.log('Paste: HTML');
        item.getAsString(function(s) {
          html.innerHTML = s;
        });
      } else if (item.kind === 'string' && item.type === 'text/uri-list') {
        // Drag data item is URI
        console.log('Paste: URI');
        item.getAsString(function(s) {
          html.innerHTML = s;
        });
      } else {
        console.log(
          'Paste: item.kind: ' + item.kind + ', item.type: ' + item.type,
        );
        item.getAsString(function(s) {
          html.innerHTML = s;
        });
      }
    }
  }
});
