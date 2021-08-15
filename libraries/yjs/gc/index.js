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
  return toJSON(yDoc);
}

function destroyDeletedContent({ gc = false } = {}) {
  const yDoc = new Y.Doc();
  yDoc.gc = gc;
  const text = yDoc.getText(TEXT_KEY);
  text.insert(0, 'AB');
  text.delete(1, 1);
  return toJSON(yDoc);
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
  return toJSON(yDoc);
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

/**
 * is `clock 3` merged into gc after `applyUpdate`?
 */
function deletedItemWithGC() {
  console.log('deletedItemWithGC');
  const yDoc = new Y.Doc();
  const xmlFragment = yDoc.getXmlFragment(FRAGMENT_KEY);
  const xmlElement = new Y.XmlElement('paragraph');
  const xmlText = new Y.XmlText('A');
  xmlElement.insert(0, [xmlText]);
  xmlFragment.insert(0, [xmlElement]);
  xmlFragment.delete(0, 1);
  xmlText.insert(1, 'B');
  /**
   * `clock 3` is deletedItem, but not gc
   */
  console.log('clock 3 is deletedItem, but not gc', toJSON(yDoc));
  const update = Y.encodeStateAsUpdate(yDoc);
  console.log('decoded update', decodeUpdate(update));
  const yDoc2 = new Y.Doc();
  Y.applyUpdate(yDoc2, update);
  /**
   * `FRAGMENT_KEY` is AbstractType but not YXmlFragment
   * If we call `yDoc2.get(FRAGMENT_KEY, Y.XmlFragment);`, `FRAGMENT_KEY` will be YXmlFragment.
   * If we call `yDoc2.get(FRAGMENT_KEY, Y.XmlElement);`, `FRAGMENT_KEY` will be YXmlElement.
   */
  yDoc2.get(FRAGMENT_KEY, Y.XmlFragment);
  /**
   * `clock 3` is in gc
   */
  console.log(toJSON(yDoc2));
}

deletedItemWithGC();

function recoverGCByApplyMultipleUpdates() {
  console.log('recoverGCByApplyMultipleUpdates');
  const yDoc1 = new Y.Doc();
  const yText1 = yDoc1.getText(TEXT_KEY);
  yText1.insert(0, 'ABC');
  const update1_1 = Y.encodeStateAsUpdate(yDoc1);

  yText1.delete(1, 1);
  const update1_2 = Y.encodeStateAsUpdate(yDoc1);
  // B is gc_ed
  console.log('yDoc1', toJSON(yDoc1));

  const yDoc2 = new Y.Doc();
  yDoc2.gc = false;
  // apply twice to get gc_ed content
  Y.applyUpdate(yDoc2, update1_1);
  // yjs does not integrate items that already integrated
  Y.applyUpdate(yDoc2, update1_2);
  yDoc2.getText(TEXT_KEY);
  console.log('yDoc2', toJSON(yDoc2));
}

function recoverGCByApplyExactUpdates1() {
  console.log('recoverGCByApplyExactUpdates1');
  const yDoc1 = new Y.Doc();
  const yText1 = yDoc1.getText(TEXT_KEY);
  yText1.insert(0, 'ABC');
  const update1_1 = Y.encodeStateAsUpdate(yDoc1);

  yText1.delete(1, 1);
  const update1_2 = Y.encodeStateAsUpdate(yDoc1, update1_1);
  // B is gc_ed
  console.log('yDoc1', toJSON(yDoc1));

  const yDoc2 = new Y.Doc();
  yDoc2.gc = false;
  Y.applyUpdate(yDoc2, update1_1);
  Y.applyUpdate(yDoc2, update1_2);
  yDoc2.getText(TEXT_KEY);
  console.log('yDoc2', toJSON(yDoc2));
}

function recoverGCByApplyExactUpdates2() {
  console.log('recoverGCByApplyExactUpdates2');
  const yDoc1 = new Y.Doc();
  const yText1 = yDoc1.getText(TEXT_KEY);
  yText1.insert(0, 'ABC');
  const update1_1 = Y.encodeStateAsUpdate(yDoc1);

  yText1.delete(1, 1);
  const update1_2 = Y.encodeStateAsUpdate(yDoc1);
  // B is gc_ed
  console.log('yDoc1', toJSON(yDoc1));

  const yDoc2 = new Y.Doc();
  yDoc2.gc = false;
  Y.applyUpdate(yDoc2, update1_1);
  const update1_2_diff = Y.diffUpdate(
    update1_2,
    Y.encodeStateVectorFromUpdate(update1_1),
  );
  Y.applyUpdate(yDoc2, update1_2_diff);
  yDoc2.getText(TEXT_KEY);
  console.log('yDoc2', toJSON(yDoc2));
}

recoverGCByApplyMultipleUpdates();
recoverGCByApplyExactUpdates1();
recoverGCByApplyExactUpdates2();
