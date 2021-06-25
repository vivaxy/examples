/**
 * @since 2021-06-25
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';

function createOption(docId) {
  const $option = document.createElement('option');
  $option.value = String(docId);
  $option.textContent = `Doc${docId}`;
  return $option;
}

function init(e) {
  let docCount = 0;
  const $fromDoc = document.getElementById('from-doc');
  const $toDoc = document.getElementById('to-doc');
  const $syncDoc = document.getElementById('sync-doc');

  function onOpenANewDoc() {
    $fromDoc.appendChild(createOption(docCount));
    $toDoc.appendChild(createOption(docCount));
    docCount++;
  }

  $syncDoc.addEventListener('click', function () {
    const from = Number($fromDoc.value);
    const to = Number($toDoc.value);
    if (from === to) {
      alert('Cannot sync the same doc');
    }
    e.emit(E.SYNC_DOC, {
      from,
      to,
    });
  });

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
}

export default { init };
