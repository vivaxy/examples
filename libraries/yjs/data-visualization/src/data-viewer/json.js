/**
 * @since 2021-08-09
 * @author vivaxy
 */
export const DATA_TYPES = {
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

const errors = {
  unexpectedConstructor(constructor) {
    return new Error('Unexpected constructor: ' + constructor);
  },
};

function deletedItemToJSON(item) {
  if ((item.info & 4) > 0) {
    return {
      deleted: true,
    };
  }
  return {};
}

function contentToJSON(content, Y) {
  if (content instanceof Y.ContentDeleted) {
    return {
      len: content.len,
    };
  }
  if (content instanceof Y.ContentAny) {
    return {
      val: content.arr[content.arr.length - 1],
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
  throw errors.unexpectedConstructor(content.constructor.name);
}

function typeMapToJSON(type) {
  const map = {};
  for (const [key, value] of type._map) {
    map[key] = toJSON(value);
  }
  return map;
}

function typeArrayToJSON(type) {
  const array = [];
  let item = type._start;
  while (item !== null) {
    array.push(toJSON(item));
    item = item.right;
  }
  return array;
}

const handlers = {
  [DATA_TYPES.DOC](doc) {
    const result = {
      share: {},
      store: {
        clients: {},
        pendingDs: null,
        pendingStructs: null,
      },
    };
    for (const [key, value] of doc.share) {
      result.share[key] = toJSON(value);
    }
    for (const [clientID, items] of doc.store.clients) {
      result.store.clients[clientID] = items.map((item) => toJSON(item));
    }
    return result;
  },
  [DATA_TYPES.Y_ARRAY](yArray) {
    return { array: typeArrayToJSON(yArray) };
  },
  [DATA_TYPES.Y_MAP](yMap) {
    return { map: typeMapToJSON(yMap) };
  },
  [DATA_TYPES.Y_TEXT](yText) {
    return { text: typeArrayToJSON(yText) };
  },
  [DATA_TYPES.Y_XML_ELEMENT](yXmlElement) {
    return {
      nodeName: yXmlElement.nodeName,
      attributes: typeMapToJSON(yXmlElement),
      children: typeArrayToJSON(yXmlElement),
    };
  },
  [DATA_TYPES.Y_XML_FRAGMENT](yXmlFragment) {
    return { children: typeArrayToJSON(yXmlFragment) };
  },
  [DATA_TYPES.Y_XML_TEXT](yXmlText) {
    return { xmlText: typeArrayToJSON(yXmlText) };
  },
  [DATA_TYPES.GC](gc) {
    return {
      client: gc.id.client,
      clock: gc.id.clock,
      length: gc.length,
    };
  },
  [DATA_TYPES.ITEM](item) {
    return {
      client: item.id.client,
      clock: item.id.clock,
      ...deletedItemToJSON(item),
      content: toJSON(item.content),
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
  [DATA_TYPES.CONTENT_TYPE](contentType) {
    return { value: toJSON(contentType.type) };
  },
};

export default function toJSON(value) {
  const constructorName = value.constructor.name;
  const handler = handlers[constructorName];
  if (!handler) {
    return {
      type: constructorName,
      error: `Unexpected type ${constructorName}`,
    };
  }
  const json = handler(value);
  console.assert(json.type === undefined, 'should not include type');
  return {
    type: constructorName,
    ...json,
  };
}
