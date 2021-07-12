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
docB.on('update', function (update, origin, yDoc) {
  console.log('update', update, 'origin', origin, 'yDoc', yDoc);
});
const textB = docB.getText(TEXT_KEY);
Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
textB.delete(1, 1);
textB.insert(1, 'T');
console.log('docA', docA, 'docB', docB);
