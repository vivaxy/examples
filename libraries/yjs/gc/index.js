/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';
import decodeUpdate from '../data-visualization/src/update-decoder';

const TEXT_KEY = 'text-key';
const FRAGMENT_KEY = 'fragment-key';

function mergeItems({ gc = false } = {}) {
  const yDoc = new Y.Doc();
  yDoc.gc = gc;

  const text = yDoc.getText(TEXT_KEY);
  text.insert(0, 'A');
  text.insert(1, 'B');
  return toJSON(yDoc, Y);
}

function destroyDeletedContent({ gc = false } = {}) {
  const yDoc = new Y.Doc();
  yDoc.gc = gc;
  const text = yDoc.getText(TEXT_KEY);
  text.insert(0, 'AB');
  text.delete(1, 1);
  return toJSON(yDoc, Y);
}

function destroyDeletedNode({ gc = false } = {}) {
  const yDoc = new Y.Doc();
  yDoc.gc = gc;
  const xmlFragment = yDoc.getXmlFragment(FRAGMENT_KEY);
  const xmlElement = new Y.XmlElement('paragraph');
  const xmlText = new Y.XmlText('A');
  xmlElement.insert(0, [xmlText]);
  xmlFragment.insert(0, [xmlElement]);
  xmlFragment.delete(0, 1);
  xmlText.insert(1, 'B');
  return toJSON(yDoc, Y);
}

console.log('mergeItems with gc', mergeItems({ gc: true }));
console.log('mergeItems without gc', mergeItems({ gc: false }));
console.log(
  'destroyDeletedContent with gc',
  destroyDeletedContent({ gc: true }),
);
console.log(
  'destroyDeletedContent without gc',
  destroyDeletedContent({ gc: false }),
);
// cannot gc `clock 3`
console.log('destroyDeletedNode with gc', destroyDeletedNode({ gc: true }));
console.log('destroyDeletedNode without gc', destroyDeletedNode({ gc: false }));

// is `clock 3` merged into gc after `applyUpdate`?
function deletedItemWithGC() {
  const yDoc = new Y.Doc();
  const xmlFragment = yDoc.getXmlFragment(FRAGMENT_KEY);
  const xmlElement = new Y.XmlElement('paragraph');
  const xmlText = new Y.XmlText('A');
  xmlElement.insert(0, [xmlText]);
  xmlFragment.insert(0, [xmlElement]);
  xmlFragment.delete(0, 1);
  xmlText.insert(1, 'B');
  // `clock 3` is deletedItem, but not gc
  console.log('clock 3 is deletedItem, but not gc', toJSON(yDoc, Y));
  const update = Y.encodeStateAsUpdate(yDoc);
  console.log('decoded update', decodeUpdate(update));
  const yDoc2 = new Y.Doc();
  Y.applyUpdate(yDoc2, update);
  console.log(toJSON(yDoc2, Y));
}
deletedItemWithGC();
