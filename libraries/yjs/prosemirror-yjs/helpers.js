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
import DATA_TYPES from '../data-visualization/src/data-viewer/data-types';
import toJSON from '../data-visualization/src/data-viewer/json';

const errors = {
  unexpected() {
    return new Error('Unexpected case');
  },
};

const SIGNALS = {
  BREAK: 'break',
};

function traverseTypeArray(type, visitor) {
  let item = type._start;
  while (item !== null) {
    const res = visitor(item, type, null);
    if (res === SIGNALS.BREAK) {
      return res;
    }
    item = item.right;
  }
}

function traverseTypeMap(type, visitor) {
  for (const [key, value] of type._map) {
    const res = visitor(value, type, key);
    if (res === SIGNALS.BREAK) {
      return res;
    }
  }
}

const handlers = {
  [DATA_TYPES.Y_ARRAY](yArray, visitor) {
    return traverseTypeArray(yArray, visitor);
  },
  [DATA_TYPES.Y_MAP](yMap, visitor) {
    return traverseTypeMap(yMap, visitor);
  },
  [DATA_TYPES.Y_TEXT](yText, visitor) {
    return traverseTypeArray(yText, visitor);
  },
  [DATA_TYPES.Y_XML_ELEMENT](yXmlElement, Y) {
    return {
      nodeName: yXmlElement.nodeName,
      attributes: typeMapToJSON(yXmlElement, Y),
      children: typeArrayToJSON(yXmlElement, Y),
    };
  },
  [DATA_TYPES.Y_XML_FRAGMENT](yXmlFragment, Y) {
    return { children: typeArrayToJSON(yXmlFragment, Y) };
  },
  [DATA_TYPES.Y_XML_TEXT](yXmlText, Y) {
    return { xmlText: typeArrayToJSON(yXmlText, Y) };
  },
  [DATA_TYPES.GC](gc, visitor) {
    visitor(gc);
  },
  [DATA_TYPES.ITEM](item, visitor) {
    visitor(item);
  },
  [DATA_TYPES.CONTENT_ANY](contentAny) {
    return { value: contentAny.arr };
  },
  [DATA_TYPES.CONTENT_BINARY](contentBinary) {
    return { binary: contentBinary.content };
  },
  [DATA_TYPES.CONTENT_DELETED](contentDeleted) {
    return { length: contentDeleted.len };
  },
  [DATA_TYPES.CONTENT_DOC](contentDoc) {
    return { doc: contentDoc.doc };
  },
  [DATA_TYPES.CONTENT_EMBED](contentEmbed) {
    return { embed: contentEmbed.embed };
  },
  [DATA_TYPES.CONTENT_FORMAT](contentFormat) {
    return { key: contentFormat.key, value: contentFormat.value };
  },
  [DATA_TYPES.CONTENT_JSON](contentJSON) {
    return { json: contentJSON.arr };
  },
  [DATA_TYPES.CONTENT_STRING](contentString) {
    return { string: contentString.str };
  },
  [DATA_TYPES.CONTENT_TYPE](contentType, Y) {
    return { value: toJSON(contentType.type, Y) };
  },
};

function dfs(item, visitor) {
  switch (item.content.constructor) {
    case Y.ContentAny:
    case Y.ContentBinary:
    case Y.ContentDeleted:
    case Y.ContentEmbed:
    case Y.ContentFormat:
    case Y.ContentJSON:
      visitor(item);
      break;
    case Y.ContentString:
      visitor(item);
      break;
    case Y.ContentType:
      switch (item.content.type.constructor) {
      }
      break;
    default:
      throw errors.unexpected();
  }
}

function getItemFromID(type, id) {}

export function getRelativePosition(rootType, relPos) {
  const { type, item } = relPos;
  let index = 0;
  let curItem = type._start;
  while (curItem && curItem !== item) {
    if (
      !curItem.deleted &&
      curItem.content.constructor.name !== 'ContentFormat'
    ) {
      index++;
    }
  }
  return {
    type,
    item,
    tname: relPos.tname,
    assoc: relPos.assoc,
    index,
  };
}
