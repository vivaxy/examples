/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

const docA = new Y.Doc();
const textA = docA.getText(TEXT_KEY);
textA.insert(0, 'XYZ');
const docB = new Y.Doc();
const textB = docB.getText(TEXT_KEY);
Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
const docBState1 = Y.encodeStateVector(docB);
textA.insert(1, 'A');
textA.insert(2, 'a');
textB.insert(1, 'B');
const docBUpdate = Y.encodeStateAsUpdate(docB, docBState1);
Y.applyUpdate(docA, docBUpdate);
console.log('textA', textA.toString());
