/**
 * @since 2019-02-03 13:51
 * @author vivaxy
 */

const input = document.querySelector('#input');
const logger = document.querySelector('#logger');
document.querySelector('#read').addEventListener('click', readClipboard);
document
  .querySelector('#readText')
  .addEventListener('click', readClipboardText);
document.querySelector('#write').addEventListener('click', writeClipboard);
document
  .querySelector('#writeText')
  .addEventListener('click', writeClipboardText);
['cut', 'copy', 'paste'].forEach((eventName) => {
  document.addEventListener(eventName, onEvent(eventName));
});

function readClipboard() {
  navigator.permissions.query({ name: 'clipboard-read' }).then((result) => {
    if (result.state === 'granted' || result.state === 'prompt') {
      navigator.clipboard.read().then((data) => {
        for (let i = 0; i < data.items.length; i++) {
          if (data.items[i].type !== 'text/plain') {
            log('Clipboard contains non-text data. Unable to access it.');
          } else {
            input.value = data.items[i].getAs('text/plain');
          }
        }
      });
    } else {
      log('clipboard-read ' + result.state);
    }
  });
}

function readClipboardText() {
  navigator.clipboard.readText().then((clipText) => {
    input.value = clipText;
  });
}

function writeClipboard() {
  navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
    if (result.state === 'granted' || result.state === 'prompt') {
      const data = new DataTransfer();
      data.items.add('text/plain', input.value);
      navigator.clipboard.write(data).then(() => {
        log('write clipboard OK');
      });
    } else {
      log('clipboard-write ' + result.state);
    }
  });
}

function writeClipboardText() {
  navigator.clipboard.writeText(input.value).then(() => {
    log('write clipboard OK');
  });
}

function onEvent(eventName) {
  return (e) => {
    log(
      'event: ' +
        eventName +
        '; type: ' +
        e.clipboardData.type +
        '; data: ' +
        e.clipboardData.getData('text/plain'),
    );

    if (eventName === 'paste') {
      pasteImage(e);
    }
  };
}

function log(c) {
  logger.innerHTML += c + '<br>';
}

function pasteImage(e) {
  const { items } = e.clipboardData || window.clipboardData;
  Array.from(items).forEach(function (item) {
    if (item.type.indexOf('image') !== -1) {
      const file = item.getAsFile();
      const img = document.createElement('img');
      img.src = URL.createObjectURL(file);
      document.body.appendChild(img);
    }
  });
}
