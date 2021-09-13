/**
 * @since 2019-02-03 13:51
 * @author vivaxy
 */
const input = document.querySelector('#input');
const logger = document.querySelector('#logger');
const $showHTMLAsHTML = document.querySelector('#html-as-html');
document.querySelector('#read').addEventListener('click', readClipboard);
document
  .querySelector('#readText')
  .addEventListener('click', readClipboardText);
document.querySelector('#write').addEventListener('click', writeClipboard);
document
  .querySelector('#writeText')
  .addEventListener('click', writeClipboardText);
['paste', 'drop', 'drag'].forEach((eventName) => {
  document.addEventListener(eventName, onEvent(eventName));
});

async function readImage(blob) {
  const objectURL = URL.createObjectURL(blob);
  const $img = document.createElement('img');
  $img.style.maxHeight = '200px';
  $img.src = objectURL;
  return $img;
}

const clipboardItemBlobReaders = {
  async 'text/plain'(blob) {
    return await blob.text();
  },
  async 'text/html'(blob) {
    return await blob.text();
  },
  'image/png': readImage,
  'image/jpg': readImage,
};

const dataTransferItemReaders = {
  string(dataTransferItem) {
    return new Promise(function (resolve) {
      dataTransferItem.getAsString(resolve);
    });
  },
  async file(dataTransferItem) {
    const file = dataTransferItem.getAsFile();
    return await readImage(file);
  },
};

async function checkClipboardPermission(permissionName) {
  const clipboardReadPermission = await navigator.permissions.query({
    name: permissionName,
  });
  if (
    clipboardReadPermission.state === 'granted' ||
    clipboardReadPermission.state === 'prompt'
  ) {
    // OK
  } else {
    throw new Error(result.state);
  }
}

async function readClipboard() {
  try {
    clearLog();
    await checkClipboardPermission('clipboard-read');

    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        const reader = clipboardItemBlobReaders[type];
        if (!reader) {
          log(type, 'Unhandled type');
          continue;
        }
        const content = await reader(blob);
        if (type === 'text/plain') {
          input.value = content;
        }
        log(content, type);
      }
    }
  } catch (e) {
    log(e.message, e.name);
  }
}

async function readClipboardText() {
  try {
    clearLog();
    await checkClipboardPermission('clipboard-read');
    const content = await navigator.clipboard.readText();
    input.value = content;
    log(content);
  } catch (e) {
    log(e.message, e.name);
  }
}

async function writeClipboard() {
  try {
    clearLog();
    await checkClipboardPermission('clipboard-write');
    const blob = new Blob([input.value], { type: 'text/plain' });
    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });
    await navigator.clipboard.write([clipboardItem]);
    log('OK');
  } catch (e) {
    log(e.message, e.name);
  }
}

async function writeClipboardText() {
  try {
    clearLog();
    await checkClipboardPermission('clipboard-write');
    await navigator.clipboard.writeText(input.value);
    log('OK');
  } catch (e) {
    log(e.message, e.name);
  }
}

function onEvent(eventName) {
  return async function (e) {
    e.preventDefault();
    clearLog();
    const dataTransfer = e.clipboardData || e.dataTransfer;
    if (!dataTransfer.items.length) {
      log('', `[${eventName}]`);
    }
    // cannot read dataTransfer in async functions
    await Promise.all(
      Array.from(dataTransfer.items).map(async function (dataTransferItem) {
        const { kind, type } = dataTransferItem;
        const reader = dataTransferItemReaders[kind];
        if (!reader) {
          log(kind, `[${eventName}] Unhandled kind`);
          return;
        }
        const content = await reader(dataTransferItem);
        log(content, `[${eventName}] ${type}`);
      }),
    );
  };
}

function clearLog() {
  logger.innerHTML = '';
}

function log(content, tag) {
  const $log = document.createElement('div');
  $log.style.fontFamily = 'monospace';
  if (tag) {
    const $tag = document.createElement('span');
    $tag.style.color = '#999';
    $tag.style.marginRight = '8px';
    $tag.textContent = tag;
    $log.appendChild($tag);
  }
  if (content instanceof HTMLElement) {
    $log.appendChild(content);
  } else {
    const $content = document.createElement('span');
    if ($showHTMLAsHTML.checked) {
      $content.innerHTML = content;
    } else {
      $content.innerText = content;
    }
    $log.appendChild($content);
  }

  logger.appendChild($log);
}
