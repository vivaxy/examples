/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as EDIT_TYPES from '../enums/edit-types.js';

let id = 0;
const DATA_ID_ATTR = 'data-id';

function getChanges(prev, cur, cursorPos) {
  if (cur.length > prev.length) {
    return {
      type: EDIT_TYPES.INSERT,
      pos: cursorPos - cur.length + prev.length,
      string: cur.slice(cursorPos - cur.length + prev.length, cursorPos),
    };
  }
  if (cur.length < prev.length) {
    return {
      type: EDIT_TYPES.DELETE,
      pos: cursorPos,
      length: prev.length - cur.length,
    };
  }
  throw new Error('Unexpected change');
}

export default function renderDocContainer($container, onChange) {
  const $doc = document.createElement('div');
  $doc.classList.add('doc-container-item');

  const $docId = document.createElement('p');
  $docId.classList.add('doc-id');
  $docId.textContent = `Doc${id}`;

  let value = '';

  const $editor = document.createElement('p');
  $editor.contentEditable = 'true';
  $editor.classList.add('editor');
  $editor.setAttribute(DATA_ID_ATTR, String(id++));
  $editor.addEventListener('input', function () {
    if ($editor.textContent !== value) {
      const cursorPos = window.getSelection().getRangeAt(0).startOffset;
      const change = getChanges(value, $editor.textContent, cursorPos);
      value = $editor.textContent;
      onChange({
        id: Number($editor.getAttribute(DATA_ID_ATTR)),
        ...change,
      });
    }
  });

  const $data = document.createElement('div');
  $data.classList.add('data');

  $doc.appendChild($docId);
  $doc.appendChild($editor);
  $doc.appendChild($data);

  $container.appendChild($doc);

  function updateEditor(content) {
    if (content !== value) {
      $editor.textContent = content;
      value = content;
    }
  }

  return { $data, updateEditor };
}
