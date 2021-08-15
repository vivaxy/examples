/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';

const TEXT_KEY = 'text-key';

const docA = new Y.Doc();
docA.clientID = 1;
const textA = docA.getText(TEXT_KEY);
textA.insert(0, 'A');
const updateA = Y.encodeStateAsUpdate(docA);

const docB = new Y.Doc();
docB.clientID = 1;
const textB = docB.getText(TEXT_KEY);
textB.insert(0, 'B');
Y.applyUpdate(docB, updateA);
console.log(toJSON(textB, Y)); // => B, missing A

const docC = new Y.Doc();
docC.clientID = 1;
Y.applyUpdate(docC, updateA);
const textC = docC.getText(TEXT_KEY);
textC.insert(0, 'B');
console.log(toJSON(textC, Y)); // => BA, correct
