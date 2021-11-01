/**
 * @since 2021-10-27
 * @author vivaxy
 * TODO:
 *  1. p2y
 *  2. y2p
 *  3. a2r
 *  4. r2a
 */
import * as Y from 'yjs';
import { XmlText } from 'yjs';

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

/**
 * @param yDoc {Y.Doc}
 *  XmlFragment
 *    XmlElement
 *      XmlText
 *    XmlElement
 *      XmlElement
 *    XmlElement
 * @param absPos {number}
 * @param length {number}
 */
export function remove(yDoc, absPos, length) {
  const xmlFragment = yDoc.get('prosemirror', Y.XmlFragment);
  let item = xmlFragment._start;
  // TODO:
  //  - remove(xmlElement, absPos, length)
  let curPos = 0;
  dfs(type, null, function (item, parent) {
    switch (item.content.constructor) {
      case Y.ContentString:
      case Y.ContentEmbed:
        const length =
          item.content.constructor === Y.ContentString
            ? item.content.content.length
            : 1;
        if (curPos === absPos) {
          relPos.rightItem = item;
          relPos.rightOffset = 0;
          return SIGNALS.BREAK;
        }
        if (curPos + length > absPos) {
          relPos.leftItem = item;
          relPos.leftOffset = absPos - curPos - 1;
          relPos.rightItem = item;
          relPos.rightOffset = absPos - curPos;
          relPos.parent = parent;
          return SIGNALS.BREAK;
        }
        if (curPos + length === absPos) {
          relPos.leftItem = item;
          relPos.leftOffset = length - 1;
        }
        curPos += length;
        break;
      case Y.ContentFormat:
      case Y.ContentDeleted:
        break;
      case Y.ContentType:
        break;
      default:
        throw errors.unexpected();
    }
  });
}
