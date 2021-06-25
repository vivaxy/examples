/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from '//esm.run/yjs';
import * as E from '../enums/event-types.js';
import * as EDIT_TYPE from '../enums/edit-types.js';
import * as Y_DOC_KEYS from '../enums/y-doc-keys.js';

function init(e) {
  const docs = [];

  function onOpenANewDoc() {
    const doc = new Y.Doc();
    doc.getText(Y_DOC_KEYS.TEXT_KEY);
    docs.push(doc);
  }

  function onDocChange(change) {
    const { id, type, pos, string, length } = change;
    const yDoc = docs[id];
    const text = yDoc.getText(Y_DOC_KEYS.TEXT_KEY);
    switch (type) {
      case EDIT_TYPE.INSERT:
        text.insert(pos, string);
        break;
      case EDIT_TYPE.DELETE:
        text.delete(pos, length);
        break;
      default:
        throw new Error('Unexpected type');
    }

    e.emit(E.Y_DOC_CHANGE, {
      id,
      yDoc,
    });
  }

  function onSyncDoc({ from, to }) {
    const fromDoc = docs[from];
    const toDoc = docs[to];
    Y.applyUpdate(toDoc, Y.encodeStateAsUpdate(fromDoc));
    e.emit(E.Y_DOC_CHANGE, { id: to, yDoc: toDoc });
  }

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
  e.on(E.DOC_CHANGE, onDocChange);
  e.on(E.SYNC_DOC, onSyncDoc);
}

export default { init };
