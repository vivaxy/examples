/**
 * @since 2021-07-29
 * @author vivaxy
 */
import * as Y from 'yjs';

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

function formatDeleted(item) {
  if (item.info >= 4) {
    return {
      deleted: true,
    };
  }
  return {};
}

function formatItem(item) {
  return {
    client: item.id.client,
    clock: item.id.clock,
    ...formatDeleted(item),
    type: item.content.constructor.name,
    ...formatContent(item.content),
  };
}

export function itemsToJSON(yNode) {
  const result = [];
  let item = yNode._start;
  while (item !== null) {
    const value = formatItem(item);
    if (
      item.content instanceof Y.ContentDeleted ||
      item.content instanceof Y.ContentString ||
      item.content instanceof Y.ContentFormat
    ) {
      // ignore
    } else if (item.content instanceof Y.ContentType) {
      value.children = itemsToJSON(item.content.type);
    } else {
      throw new Error('Unexpect content');
    }
    result.push(value);
    item = item.right;
  }
  return result;
}
