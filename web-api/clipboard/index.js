/**
 * @since 2019-02-03 13:51
 * @author vivaxy
 */
document.querySelector('#read').addEventListener('click', readClipboard);
document.querySelector('#write').addEventListener('click', writeClipboard);
const $content = document.querySelector('#content');

['paste', 'drop', 'drag'].forEach((eventName) => {
  document.addEventListener(eventName, onEvent(eventName));
});

let items = [];
let mos = [];
let showAs = 'text';

['show-as-text', 'show-as-html'].forEach(function (id) {
  document.getElementById(id).addEventListener('change', function (e) {
    showAs = e.target.value;
    updateItems(items);
  });
});

async function imageReader(blob) {
  const objectURL = URL.createObjectURL(blob);
  const $img = document.createElement('img');
  $img.style.maxHeight = '200px';
  $img.src = objectURL;
  return $img;
}

function imageRenderer($parent, data) {
  if (showAs === 'html') {
    $parent.appendChild(data);
  } else {
    $parent.textContent = data;
  }
}

function domWriter($parent) {
  if (showAs === 'html') {
    return $parent.innerHTML;
  }
  return $parent.textContent;
}

async function textPlainReader(blob) {
  return await blob.text();
}

function textPlainRenderer($parent, data) {
  $parent.textContent = data;
}

function textPlainWriter($parent) {
  return $parent.textContent;
}

const textPlainHandler = {
  reader: textPlainReader,
  render: textPlainRenderer,
  writer: textPlainWriter,
  clipboardWriter: defaultClipboardWriter,
};

const imageHandler = {
  reader: imageReader,
  render: imageRenderer,
  writer: domWriter,
};

function defaultClipboardWriter(data, type, clipboardItems) {
  const blob = new Blob([data], { type });
  clipboardItems[blob.type] = blob;
}

const typeHandlers = {
  'text/plain': textPlainHandler,
  'text/link-preview': {
    reader: textPlainReader,
    render: textPlainRenderer,
    writer: textPlainWriter,
  },
  'text/html': {
    reader: textPlainReader,
    render($parent, data) {
      if (showAs === 'html') {
        $parent.innerHTML = data;
      } else {
        $parent.textContent = data;
      }
    },
    writer: domWriter,
    clipboardWriter: defaultClipboardWriter,
  },
  'image/png': imageHandler,
  'image/jpg': imageHandler,
};

const dataTransferItemReaders = {
  string(dataTransferItem) {
    return new Promise(function (resolve) {
      dataTransferItem.getAsString(resolve);
    });
  },
  async file(dataTransferItem) {
    const file = dataTransferItem.getAsFile();
    return await imageReader(file);
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
    throw new Error('Permission not granted');
  }
}

async function readClipboard() {
  try {
    const newItems = [];
    await checkClipboardPermission('clipboard-read');

    const clipboardItems = await navigator.clipboard.read();
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        const blob = await clipboardItem.getType(type);
        const handler = typeHandlers[type];
        if (!handler) {
          newItems.push({ type, data: 'Unhandled type' });
          continue;
        }
        const content = await handler.reader(blob);
        newItems.push({ type, data: content });
        updateItems(newItems);
      }
    }
  } catch (e) {
    console.error('navigator.clipboard.read', e);
  }
}

async function writeClipboard() {
  try {
    await checkClipboardPermission('clipboard-write');
    const clipboardItems = {};
    items.forEach(function ({ type, data }) {
      if (typeHandlers[type]?.clipboardWriter) {
        typeHandlers[type].clipboardWriter(data, type, clipboardItems);
      }
    });
    await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
  } catch (e) {
    console.error('navigator.clipboard.write', e);
  }
}

function onEvent() {
  return async function (e) {
    if ($content.contains(e.target)) {
      return;
    }
    const dataTransfer = e.clipboardData || e.dataTransfer;
    if (!dataTransfer.items.length) {
      console.log('dataTransfer.items.length', dataTransfer.items.length);
      return;
    }
    const newItems = await Promise.all(
      Array.from(dataTransfer.items).map(async function (dataTransferItem) {
        const { kind, type } = dataTransferItem;
        const reader = dataTransferItemReaders[kind];
        if (!reader) {
          return { type, data: '' };
        }
        const content = await reader(dataTransferItem);
        return { type, data: content };
      }),
    );
    updateItems(newItems);
  };
}

function removeItem(itemIndex) {
  items.splice(itemIndex, 1);
  updateItems(items);
}

function updateItems(newItems) {
  mos.forEach(function (mo) {
    mo.disconnect();
  });
  items = newItems;

  const $tbody = $content.querySelector('tbody');

  const $newRows = items.map(function ({ type, data }, index) {
    const $removeCell = document.createElement('td');
    const $removeButton = document.createElement('button');
    $removeButton.addEventListener('click', function () {
      removeItem(index);
    });
    $removeButton.textContent = '-';
    $removeButton.title = 'Remove Clipboard Item';
    $removeCell.appendChild($removeButton);

    const $typeCell = document.createElement('td');
    const $type = document.createElement('p');
    $type.textContent = type;
    $typeCell.appendChild($type);

    const $dataCell = document.createElement('td');
    $dataCell.setAttribute('contenteditable', 'true');
    const handler = typeHandlers[type];
    if (handler) {
      handler.render($dataCell, data);
    } else {
      $dataCell.textContent = 'Unknown type';
    }

    const mo = new MutationObserver(function () {
      if (!handler) {
        items[index].data = 'Unknown type';
      } else {
        items[index].data = handler.writer($dataCell);
      }
    });
    mo.observe($dataCell, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    mos.push(mo);

    const $row = document.createElement('tr');
    $row.appendChild($removeCell);
    $row.appendChild($typeCell);
    $row.appendChild($dataCell);
    return $row;
  });

  $tbody.replaceChildren(...$newRows);
}
