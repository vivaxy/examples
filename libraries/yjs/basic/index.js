/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';
const FRAGMENT_KEY = 'fragment-key';

function updateText() {
  const docA = new Y.Doc();
  const textA = docA.getText(TEXT_KEY);
  textA.insert(0, 'A');
  textA.insert(1, 'BC');
  textA.delete(1, 1);
  textA.insert(1, 'T');
  textA.insert(0, 'X');
  console.log('textA', textA);
}

function syncDocs() {
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
}

function updateYXmlFragment() {
  const docA = new Y.Doc();
  const fragmentA = docA.getXmlFragment(FRAGMENT_KEY);
  fragmentA.insert(0, [new Y.XmlText('A')]);
  fragmentA.insert(1, [new Y.XmlText('B')]);
  fragmentA.delete(0, 1);
  fragmentA.insert(1, [new Y.XmlElement('div')]);
  console.log('fragmentA', fragmentA);
}

function mergeConflict() {
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
}

function relativePositionAndAbsolutePosition() {
  const doc = new Y.Doc();
  const fragment = doc.getXmlFragment(FRAGMENT_KEY);
  const text1 = new Y.XmlText('ABC');
  const text2 = new Y.XmlText('OPQ');
  const text3 = new Y.XmlText('XYZ');
  fragment.insert(0, [text1]);
  fragment.insert(1, [text2]);
  fragment.insert(2, [text3]);
  fragment.delete(1, 1);
  console.log('fragment', fragment);
  const relPos = Y.createRelativePositionFromTypeIndex(text1, 1);
  console.log('relPos', relPos);
  const absPos = Y.createAbsolutePositionFromRelativePosition(relPos, doc);
  console.log('absPos', absPos);
}

updateText();
syncDocs();
updateYXmlFragment();
mergeConflict();
relativePositionAndAbsolutePosition();
