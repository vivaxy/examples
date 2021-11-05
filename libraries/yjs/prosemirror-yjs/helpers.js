/**
 * @since 2021-10-27
 * @author vivaxy
 */
import * as Y from 'yjs';
import { Fragment } from 'prosemirror-model';

const errors = {
  unexpected(message = 'case') {
    return new Error('Unexpected ' + message);
  },
};

const SIGNALS = {
  BREAK: 'break',
};

function dfsTypeArray(array, parent, visitor) {
  let item = array._start;
  while (item !== null) {
    const res = dfs(item, array, visitor);
    if (res === SIGNALS.BREAK) {
      return res;
    }
    item = item.right;
  }
  return null;
}

function dfsTypeMap(map, parent, visitor) {
  for (const [_, value] of map._map) {
    const res = dfs(value, map, visitor);
    if (res === SIGNALS.BREAK) {
      return res;
    }
  }
  return null;
}

function dfs(item, parent, visitor) {
  switch (item.content.constructor) {
    case Y.ContentDeleted:
    case Y.ContentEmbed:
    case Y.ContentFormat:
    case Y.ContentString:
      return visitor(item, parent);
    case Y.ContentType:
      const res = visitor(item, parent);
      if (res === SIGNALS.BREAK) {
        return SIGNALS.BREAK;
      }
      switch (item.content.type.constructor) {
        case Y.XmlText:
        case Y.XmlFragment:
        case Y.XmlElement:
          return dfsTypeArray(item.content.type, parent, dfs);
        default:
          throw errors.unexpected(item.content.type.constructor.name);
      }
    default:
      throw errors.unexpected(item.content.constructor.name);
  }
}

export function insert(yDoc, absPos, slice) {}

const removeHandlers = {
  [Y.ContentType](item, schema, absPos, length) {
    let removedLength = 0;
    let totalLength = 0;

    if (length <= 0) {
      return { removedLength, totalLength };
    }

    const { type } = item.content;

    switch (type.constructor) {
      case Y.XmlElement:
        const { nodeName } = type;
        const nodeType = schema.nodes[nodeName];
        if (nodeType.isBlock && nodeType.isLeaf) {
          totalLength = 1;
          removedLength +=
            Math.max(0, totalLength - absPos) +
            Math.max(0, absPos + length - totalLength);
          if (removedLength) {
            debugger;
          }
        } else if (nodeType.isBlock && !nodeType.isLeaf) {
          totalLength += 1;
          absPos -= 1;
          const { removedLength: rl, totalLength: tl } = removeFromTypeArray(
            type,
            schema,
            absPos,
            length,
          );
          removedLength += rl;
          totalLength += tl;
          totalLength += 1;
          absPos -= 1;
        } else {
          throw errors.unexpected();
        }
        break;
      case Y.XmlText:
        const oLength = type._length;
        totalLength += oLength;
        type.delete(absPos, length);
        removedLength += type._length - oLength;
        break;
      default:
        throw errors.unexpected();
    }
    return { removedLength, totalLength };
  },
  [Y.ContentString](item, schema, absPos, length) {
    const totalLength = item.content.str.length;
    const removedLength =
      Math.max(0, totalLength - absPos) +
      Math.max(0, absPos + length - totalLength);
    if (removedLength) {
      item.content.remove(absPos, length);
    }
    return { removedLength, totalLength };
  },
};

function removeFromTypeArray(xmlFragment, schema, absPos, length) {
  let totalLength = 0;
  let removedLength = 0;
  let item = xmlFragment._start;
  while (item) {
    const removeHandler = removeHandlers[item.content.constructor];
    if (!removeHandler) {
      throw errors.unexpected();
    }
    const { removedLength: rl, totalLength: tl } = removeHandler(
      item,
      schema,
      absPos,
      length,
    );
    absPos -= tl;
    length -= rl;
    totalLength += tl;
    removedLength += rl;
    item = item.right;
  }
  return { removedLength, totalLength };
}

/**
 * @param yDoc {Y.Doc}
 *  XmlFragment
 *    XmlElement
 *      XmlText
 *    XmlElement
 *      XmlElement
 *    XmlElement
 * @param schema {Schema}
 * @param absPos {number}
 * @param length {number}
 */
export function remove(yDoc, schema, absPos, length) {
  const xmlFragment = yDoc.get('prosemirror', Y.XmlFragment);
  removeFromTypeArray(xmlFragment, schema, absPos, length);
}

export function p2y(pDoc, yDoc = new Y.Doc()) {
  const type = yDoc.get('prosemirror', Y.XmlFragment);
  console.assert(pDoc.type.name === 'doc');
  p2yInsertIntoFragment(pDoc.content, type);
  return yDoc;
}

function p2yInsertIntoFragment(fragment, yFragment) {
  const toInsert = [];
  fragment.content.forEach(function (node) {
    toInsert.push(p2yNode(node));
  });
  yFragment.insert(0, toInsert);
}

function p2yNode(node) {
  if (node.type.name === 'text') {
    return p2yText(node);
  }
  const yElement = new Y.XmlElement(node.type.name);
  Object.keys(node.attrs).forEach(function (attrKey) {
    yElement.setAttribute(attrKey, node.attrs[attrKey]);
  });
  if (!node.isLeaf) {
    p2yInsertIntoFragment(node.content, yElement);
  }
  return yElement;
}

function p2yText(textNode) {
  // TODO:
}

function forEachTypeArray(array, f) {
  let item = array._start;
  while (item) {
    f(item);
    item = item.right;
  }
}

function forEachTypeMap(map, f) {
  for (const [key, value] of map._map) {
    f(value, key);
  }
}

function getMap(map) {
  const result = {};
  forEachTypeMap(map, function (value, key) {
    let lastValue = null;
    forEachTypeArray(value, function (item) {
      if (item && !item.deleted) {
        lastValue = item.value;
      }
    });
    if (lastValue) {
      result[key] = lastValue;
    }
  });
  return result;
}

export function y2p(yDoc, schema) {
  const type = yDoc.get('prosemirror', Y.XmlFragment);
  const fragment = y2pFragment(type, schema);
  return schema.node('doc', null, fragment);
}

function y2pFragment(type, schema) {
  let fragment = Fragment.empty;
  forEachTypeArray(type, function (item) {
    if (item.content.constructor === Y.ContentType) {
      if (item.content.type.constructor === Y.XmlElement) {
        const node = y2pElement(item.content.type, schema);
        fragment.addToEnd(node);
      } else {
        throw errors.unexpected();
      }
    }
  });
  return fragment;
}

function y2pElement(type, schema) {
  const nodeName = type.nodeName;
  const attrs = getMap(type);
  const fragment = y2pFragment(type);
  return schema.node(nodeName, attrs, fragment);
}
