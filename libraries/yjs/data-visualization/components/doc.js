/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as EDIT_TYPES from '../enums/edit-types.js';

function getDiffStart(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length) - 1; i++) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
}

function getDiffEnd(a, b) {
  for (let i = Math.min(a.length, b.length) - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return i;
    }
  }
}

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

export default function createDoc($container, onChange) {
  const $doc = document.createElement('div');
  const $editor = document.createElement('p');
  const $data = document.createElement('div');

  let value = '';
  $editor.contentEditable = 'true';
  $editor.addEventListener('input', function () {
    if ($editor.textContent !== value) {
      const cursorPos = window.getSelection().getRangeAt(0).startOffset;
      const change = getChanges(value, $editor.textContent, cursorPos);
      value = $editor.textContent;
      onChange(change);
    }
  });

  $doc.appendChild($editor);
  $doc.appendChild($data);

  $container.appendChild($doc);
}
