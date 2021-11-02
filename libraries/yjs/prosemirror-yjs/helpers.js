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

export function insert(yDoc, absPos, slice) {}

const removeHandlers = {
  [Y.ContentType](item, absPos, length) {
    switch (item.content.type.constructor) {
      case Y.XmlElement:
        break;
      default:
        throw errors.unexpected();
    }
    return { removedLength: 0, totalLength: 0 };
  },
};

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
  while (item) {
    const removeHandler = removeHandlers[item.content.constructor];
    if (!removeHandler) {
      throw errors.unexpected();
    }
    const { removedLength, totalLength } = removeHandler(yDoc, absPos, length);
    absPos -= totalLength;
    length -= removedLength;
    item = item.right;
  }
}
