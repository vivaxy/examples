/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from '//esm.run/yjs';
import * as E from '../enums/event-types.js';
import * as EDIT_TYPE from '../enums/edit-types.js';

const TEXT_KEY = 'sample-key';

function init(e) {
  const docs = [];

  function onOpenANewDoc() {
    const doc = new Y.Doc();
    docs.push(doc);
  }

  function onDocChange(change) {
    const { id, type, pos, string, length } = change;
    const doc = docs[id];
    const text = doc.getText(TEXT_KEY);
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
      doc,
      change,
    });
  }

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
  e.on(E.DOC_CHANGE, onDocChange);
}

export default { init };
