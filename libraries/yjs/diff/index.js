/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import updateDecoder from '../data-visualization/src/update-decoder';

const TEXT_KEY = 'text-key';

const docA = new Y.Doc();
const textA = docA.getText(TEXT_KEY);
textA.insert(0, 'XA');
const updateA = Y.encodeStateAsUpdate(docA);

const docB = new Y.Doc();
const textB = docB.getText(TEXT_KEY);
textB.insert(0, 'XB');
textB.observeDeep(function (event) {
  console.log('change', event);
});
const svB = Y.encodeStateVector(docB);

const diff1 = Y.diffUpdate(updateA, svB);
console.log('diff1', updateDecoder(docA.clientID, diff1));
console.log('diff1', updateDecoder(docB.clientID, diff1));
Y.applyUpdate(docB, diff1);
console.log('textB', textB.toString(), docB);

const docC = new Y.Doc();
// force docC to be same client as docA
docC.clientID = docA.clientID;
const textC = docC.getText(TEXT_KEY);
textC.insert(0, 'XC');
const svC = Y.encodeStateVector(docC);
const diff2 = Y.diffUpdate(updateA, svC); // cannot diff
console.log('diff2', updateDecoder(docA.clientID, diff2));
console.log('diff2', updateDecoder(docC.clientID, diff2));
Y.applyUpdate(docC, diff2);
// missing updates
console.log('textC', textC.toString(), docC);
