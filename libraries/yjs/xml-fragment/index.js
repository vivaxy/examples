/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

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

function formatContent(content) {
  if (content instanceof Y.ContentDeleted) {
    return {
      len: content.len,
    };
  }
  if (content instanceof Y.ContentType) {
    if (content.type instanceof Y.XmlElement) {
      if (content.type._map.size) {
        return {
          typeName: content.type.constructor.name,
          nodeName: content.type.nodeName,
          attrs: Object.fromEntries(content.type._map),
        };
      }
      return {
        typeName: content.type.constructor.name,
        nodeName: content.type.nodeName,
      };
    }
    if (content.type instanceof Y.XmlText) {
      if (content.type._map.size) {
        return {
          typeName: content.type.constructor.name,
          attrs: Object.fromEntries(content.type._map),
        };
      }
      return {
        typeName: content.type.constructor.name,
      };
    }
  }
  if (content instanceof Y.ContentString) {
    return {
      str: content.str,
    };
  }
  if (content instanceof Y.ContentFormat) {
    return {
      key: content.key,
      value: content.value,
    };
  }
  throw new Error('Unexpected content');
}

function formatItem(item) {
  return {
    client: item.id.client,
    clock: item.id.clock,
    type: item.content.constructor.name,
    ...formatContent(item.content),
  };
}

function traverseFragment(node, visitor) {
  let item = node._start;
  while (item !== null) {
    visitor(formatItem(item));
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
