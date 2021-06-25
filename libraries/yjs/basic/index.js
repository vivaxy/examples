/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const SAMPLE_KEY = 'sample_key';

const docA = new Y.Doc();
const textA = docA.getText(SAMPLE_KEY);
textA.insert(0, 'A');
textA.insert(1, 'BC');
textA.delete(1, 1);
textA.insert(1, 'T');
textA.insert(0, 'X');
console.log('textA', textA);

/**
 * 2 Docs Scenario Without Conflicts
 */
const docB = new Y.Doc();
docB.on('update', function (update, origin, yDoc) {
  console.log('update', update, 'origin', origin, 'yDoc', yDoc);
});
const textB = docB.getText(SAMPLE_KEY);
Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
textB.delete(1, 1);
textB.insert(1, 'T');
console.log('docA', docA, 'docB', docB);

const stateVectorB = Y.encodeStateVector(docB);
console.log('stateVectorB', stateVectorB);
