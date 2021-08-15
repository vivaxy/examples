/**
 * @since 2021-08-09
 * @author vivaxy
 */
export const DATA_TYPES = {
  // utils
  DOC: 'Doc',

  // types
  ABSTRACT_TYPE: 'AbstractType',
  Y_ARRAY: 'YArray',
  Y_MAP: 'YMap',
  Y_TEXT: 'YText',
  Y_XML_ELEMENT: 'YXmlElement',
  Y_XML_FRAGMENT: 'YXmlFragment',
  Y_XML_TEXT: 'YXmlText',

  // structs
  ABSTRACT_STRUCT: 'AbstractStruct',
  GC: 'GC',
  ITEM: 'Item',
  Skip: 'Skip',

  // contents
  CONTENT_ANY: 'ContentAny',
  CONTENT_BINARY: 'ContentBinary',
  CONTENT_DELETED: 'ContentDeleted',
  CONTENT_DOC: 'ContentDoc',
  CONTENT_EMBED: 'ContentEmbed',
  CONTENT_FORMAT: 'ContentFormat',
  CONTENT_JSON: 'ContentJSON',
  CONTENT_STRING: 'ContentString',
  CONTENT_TYPE: 'ContentType',
};

function deletedItemToJSON(item) {
  if ((item.info & 4) > 0) {
    return {
      deleted: true,
    };
  }
  return {};
}

function typeMapToJSON(type, Y) {
  const map = {};
  for (const [key, value] of type._map) {
    map[key] = toJSON(value, Y);
  }
  return map;
}

function typeArrayToJSON(type, Y) {
  const array = [];
  let item = type._start;
  while (item !== null) {
    array.push(toJSON(item, Y));
    item = item.right;
  }
  return array;
}

const handlers = {
  [DATA_TYPES.DOC](doc, Y) {
    const result = {
      share: {},
      store: {
        clients: {},
        pendingDs: null,
        pendingStructs: null,
      },
    };
    for (const [key, value] of doc.share) {
      result.share[key] = toJSON(value, Y);
    }
    for (const [clientID, items] of doc.store.clients) {
      result.store.clients[clientID] = items.map((item) => toJSON(item, Y));
    }
    return result;
  },
  [DATA_TYPES.Y_ARRAY](yArray, Y) {
    return { array: typeArrayToJSON(yArray, Y) };
  },
  [DATA_TYPES.Y_MAP](yMap, Y) {
    return { map: typeMapToJSON(yMap, Y) };
  },
  [DATA_TYPES.Y_TEXT](yText, Y) {
    return { text: typeArrayToJSON(yText, Y) };
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
  [DATA_TYPES.GC](gc) {
    return {
      client: gc.id.client,
      clock: gc.id.clock,
      length: gc.length,
    };
  },
  [DATA_TYPES.ITEM](item, Y) {
    return {
      client: item.id.client,
      clock: item.id.clock,
      ...deletedItemToJSON(item),
      content: toJSON(item.content, Y),
    };
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

function getDataType(value, Y) {
  switch (value.constructor) {
    // utils
    case Y.Doc:
      return DATA_TYPES.DOC;
    // types
    case Y.Array:
      return DATA_TYPES.Y_ARRAY;
    case Y.Map:
      return DATA_TYPES.Y_MAP;
    case Y.Text:
      return DATA_TYPES.Y_TEXT;
    case Y.XmlElement:
      return DATA_TYPES.Y_XML_ELEMENT;
    case Y.XmlFragment:
      return DATA_TYPES.Y_XML_FRAGMENT;
    case Y.XmlText:
      return DATA_TYPES.Y_XML_TEXT;
    case Y.AbstractType:
      return DATA_TYPES.ABSTRACT_TYPE;
    // structs
    case Y.Item:
      return DATA_TYPES.ITEM;
    case Y.GC:
      return DATA_TYPES.GC;
    case Y.Skip:
      return DATA_TYPES.Skip;
    case Y.AbstractStruct:
      return DATA_TYPES.ABSTRACT_STRUCT;
    // contents
    case Y.ContentAny:
      return DATA_TYPES.CONTENT_ANY;
    case Y.ContentBinary:
      return DATA_TYPES.CONTENT_BINARY;
    case Y.ContentDeleted:
      return DATA_TYPES.CONTENT_DELETED;
    // Skip CONTENT_DOC
    case Y.ContentEmbed:
      return DATA_TYPES.CONTENT_EMBED;
    case Y.ContentFormat:
      return DATA_TYPES.CONTENT_FORMAT;
    case Y.ContentJSON:
      return DATA_TYPES.CONTENT_JSON;
    case Y.ContentString:
      return DATA_TYPES.CONTENT_STRING;
    case Y.ContentType:
      return DATA_TYPES.CONTENT_TYPE;
    default:
      return null;
  }
}

export default function toJSON(value, Y) {
  console.assert(Y, 'pass Y');
  const type = getDataType(value, Y);
  const handler = handlers[type];
  if (!handler) {
    return {
      type: type,
      error: `Unexpected type ${type}`,
    };
  }
  const json = handler(value, Y);
  console.assert(json.type === undefined, 'should not include type');
  return {
    type: type,
    ...json,
  };
}
