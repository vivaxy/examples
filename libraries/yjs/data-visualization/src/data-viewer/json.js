/**
 * @since 2021-08-09
 * @author vivaxy
 */
const errors = {
  unexpectedConstructor(constructor) {
    return new Error('Unexpected constructor: ' + constructor);
  },
  notImplemented() {
    return new Error('Not implemented');
  },
};

function deletedItemToJSON(item) {
  if (item.info >= 4) {
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

function itemToJSON(item, Y) {
  return {
    client: item.id.client,
    clock: item.id.clock,
    type: item.content.constructor.name,
    ...deletedItemToJSON(item, Y),
    ...contentToJSON(item.content, Y),
  };
}

function xmlFragmentToJSON(yXmlFragment, Y) {
  const result = [];
  let item = yXmlFragment._start;
  while (item !== null) {
    const value = itemToJSON(item, Y);
    if (item.content instanceof Y.ContentType) {
      value.children = typeToJSON(item.content.type, Y);
    } else if (
      item.content instanceof Y.ContentAny ||
      item.content instanceof Y.ContentBinary ||
      item.content instanceof Y.ContentDeleted ||
      item.content instanceof Y.ContentEmbed ||
      item.content instanceof Y.ContentFormat ||
      item.content instanceof Y.ContentJSON ||
      item.content instanceof Y.ContentString
    ) {
      // ignore
    } else {
      throw errors.unexpectedConstructor(item.content.constructor.name);
    }
    result.push(value);
    item = item.right;
  }
  return result;
}

function textToJSON(text, Y) {
  const result = [];
  let item = text._start;
  while (item !== null) {
    result.push(structToJSON(item, Y));
    item = item.right;
  }
  return result;
}

function docToJSON(doc, Y) {
  const result = {
    share: {},
    store: {
      clients: {},
      pendingDs: null,
      pendingStructs: null,
    },
  };
  for (const [key, value] of doc.share.entries()) {
    result.share[key] = toJSON(value, Y);
  }
  for (const [clientID, items] of doc.store.clients.entries()) {
    result.store.clients[clientID] = items.map((item) => structToJSON(item, Y));
  }
  return result;
}

function xmlTextToJSON(type, Y) {
  throw errors.notImplemented();
}

function typeToJSON(type, Y) {
  if (type instanceof Y.XmlFragment) {
    return xmlFragmentToJSON(type, Y);
  }
  if (type instanceof Y.XmlText) {
    return xmlTextToJSON(type, Y);
  }
  if (type instanceof Y.Text) {
    return textToJSON(type, Y);
  }
  throw errors.unexpectedConstructor(type.constructor.name);
}

function gcToItem(gc) {
  return {
    client: gc.id.client,
    clock: gc.id.clock,
    type: 'GC',
    deleted: true,
    length: gc.length,
  };
}

function structToJSON(struct, Y) {
  if (struct instanceof Y.Item) {
    return itemToJSON(struct, Y);
  }
  if (struct instanceof Y.GC) {
    return gcToItem(struct, Y);
  }
  throw errors.unexpectedConstructor(struct.constructor.name);
}

export default function toJSON(value, Y) {
  if (value instanceof Y.Doc) {
    return docToJSON(value, Y);
  }
  if (value instanceof Y.AbstractType) {
    return typeToJSON(value, Y);
  }
  if (value instanceof Y.AbstractStruct) {
    return structToJSON(value, Y);
  }

  throw errors.unexpectedConstructor(value.constructor.name);
}
