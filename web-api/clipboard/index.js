/**
 * @since 2019-02-03 13:51
 * @author vivaxy
 */
document.querySelector('#read').addEventListener('click', readClipboard);
document.querySelector('#write').addEventListener('click', writeClipboard);

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

async function readImage(blob) {
  const objectURL = URL.createObjectURL(blob);
  const $img = document.createElement('img');
  $img.style.maxHeight = '200px';
  $img.src = objectURL;
  return $img;
}

function renderDOM($parent, data) {
  if (showAs === 'html') {
    $parent.appendChild(data);
  } else {
    $parent.textContent = data;
  }
}

const typeHandlers = {
  'text/plain': {
    async reader(blob) {
      return await blob.text();
    },
    render($parent, data) {
      $parent.textContent = data;
    },
  },
  'text/html': {
    async reader(blob) {
      return await blob.text();
    },
    render($parent, data) {
      if (showAs === 'html') {
        $parent.innerHTML = data;
      } else {
        $parent.textContent = data;
      }
    },
  },
  'image/png': {
    reader: readImage,
    render: renderDOM,
  },
  'image/jpg': {
    reader: readImage,
    render: renderDOM,
  },
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
      const blob = new Blob([data], { type });
      clipboardItems[blob.type] = blob;
    });
    await navigator.clipboard.write([new ClipboardItem(clipboardItems)]);
  } catch (e) {
    console.error('navigator.clipboard.write', e);
  }
}

function onEvent() {
  return async function (e) {
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
          return { type, data: 'Unknown type' };
        }
        const content = await reader(dataTransferItem);
        return { type, data: content };
      }),
    );
    updateItems(newItems);
  };
}

function updateItems(newItems) {
  mos.forEach(function (mo) {
    mo.disconnect();
  });
  items = newItems;

  const $content = document.querySelector('#content');
  const $tbody = $content.querySelector('tbody');

  const $newRows = items.map(function ({ type, data }, index) {
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
      items[index].data = $dataCell.innerHTML;
    });
    mo.observe($dataCell, {
      childList: true,
      characterData: true,
      subtree: true,
    });
    mos.push(mo);

    const $row = document.createElement('tr');
    $row.appendChild($typeCell);
    $row.appendChild($dataCell);
    return $row;
  });

  $tbody.replaceChildren(...$newRows);
}
