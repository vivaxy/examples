/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

const docA = new Y.Doc();
const textA = docA.getText(TEXT_KEY);
textA.insert(0, 'ABC');
const docB = new Y.Doc();
const textB = docB.getText(TEXT_KEY);
Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
const snapshot1 = Y.snapshot(docB);
textB.delete(1, 1);
const snapshot2 = Y.snapshot(docB);
textB.insert(1, 'T');
const snapshot3 = Y.snapshot(docB);
console.log(
  'snapshot with deleteSet and stateMap',
  snapshot1,
  snapshot2,
  snapshot3,
);
