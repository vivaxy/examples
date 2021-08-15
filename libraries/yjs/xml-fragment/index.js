/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';

const FRAGMENT_KEY = 'fragment-key';

const docA = new Y.Doc();
window.docA = docA;
// docA.gc = false;
const fragmentA = docA.getXmlFragment(FRAGMENT_KEY);
fragmentA.insert(0, [new Y.XmlText('A')]);
fragmentA.insert(1, [new Y.XmlText('B')]);
fragmentA.delete(0, 1);
const elementA = new Y.XmlElement('div');
fragmentA.insert(1, [elementA]);
elementA.insert(0, [new Y.XmlText('C')]);
console.log('fragmentA:', fragmentA.toJSON());

function traverseFragment(node, visitor) {
  let item = node._start;
  while (item !== null) {
    visitor(toJSON(item));
    if (
      item.content instanceof Y.ContentDeleted ||
      item.content instanceof Y.ContentString ||
      item.content instanceof Y.ContentFormat
    ) {
      // ignore
    } else if (item.content instanceof Y.ContentType) {
      traverseFragment(item.content.type, visitor);
    } else {
      throw new Error('Unexpect content');
    }
    item = item.right;
  }
}

traverseFragment(fragmentA, function (item) {
  console.log('item', item);
});
