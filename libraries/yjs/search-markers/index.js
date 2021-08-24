/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text';

function appendText(mergedYDoc, text) {
  const yDoc = new Y.Doc();
  const yText = yDoc.get(TEXT_KEY, Y.XmlText);
  Y.applyUpdate(yDoc, Y.encodeStateAsUpdate(mergedYDoc));
  yText.insert(yText.toString().length, text);
  Y.applyUpdate(mergedYDoc, Y.encodeStateAsUpdate(yDoc));
}

const yDoc = new Y.Doc();
const yText = yDoc.get(TEXT_KEY, Y.XmlText);
appendText(yDoc, 'A');
appendText(yDoc, 'B');
appendText(yDoc, 'C');
appendText(yDoc, 'D');
yText.insert(2, 'E');
console.assert(yText._searchMarker.length === 1);
yText.insert(1, 'F');
