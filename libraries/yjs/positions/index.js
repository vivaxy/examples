/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const FRAGMENT_KEY = 'fragment-key';

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
