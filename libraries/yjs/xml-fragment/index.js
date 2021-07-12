/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const FRAGMENT_KEY = 'fragment-key';

const docA = new Y.Doc();
const fragmentA = docA.getXmlFragment(FRAGMENT_KEY);
fragmentA.insert(0, [new Y.XmlText('A')]);
fragmentA.insert(1, [new Y.XmlText('B')]);
fragmentA.delete(0, 1);
fragmentA.insert(1, [new Y.XmlElement('div')]);
console.log('fragmentA', fragmentA);
