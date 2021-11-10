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
  operationFailed(message = 'Operation') {
    return new Error(message + ' failed');
  },
};

const SIGNALS = {
  BREAK: 'break',
};

const INSERTED = -1;

export function insert(xmlFragment, schema, absPos, slice) {
  const yNodes = p2yFragment(slice.content);
  const length = insertXmlFragment(xmlFragment, schema, absPos, yNodes);
  if (length !== INSERTED) {
    throw errors.operationFailed('Insert');
  }
}

function insertXmlFragment(xmlFragment, schema, absPos, yNodes) {
  if (absPos === 0) {
    xmlFragment.insert(0, yNodes);
    return INSERTED;
  }
  let pos = 0;
  let offset = 0;
  forEachTypeArray(xmlFragment, function (item) {
    if (absPos === pos) {
      xmlFragment.insert(offset, yNodes);
      pos = INSERTED;
      return SIGNALS.BREAK;
    }
    if (item.content.type.constructor === Y.XmlText) {
      const length = insertXmlText(
        item.content.type,
        schema,
        absPos - pos,
        yNodes,
      );
      if (length === INSERTED) {
        pos = INSERTED;
        return SIGNALS.BREAK;
      }
      pos += length;
      offset += 1;
    } else if (item.content.type.constructor === Y.XmlElement) {
      if (schema.nodes[item.content.type.nodeName].isLeaf) {
        pos += 1;
        offset += 1;
      } else {
        pos += 1;
        const length = insertXmlElement(
          item.content.type,
          schema,
          absPos - pos,
          yNodes,
        );
        if (length === INSERTED) {
          pos = INSERTED;
          return SIGNALS.BREAK;
        }
        pos += length;
        pos += 1;
        offset += 1;
      }
    } else {
      throw errors.unexpected();
    }
  });
  return pos;
}

function insertXmlElement(xmlElement, schema, absPos, yNodes) {
  return insertXmlFragment(xmlElement, schema, absPos, yNodes);
}

function insertXmlText(xmlText, schema, absPos, yNodes) {
  if (absPos < xmlText.length) {
    xmlText.insert(
      absPos,
      yNodes
        .map(function (yNode) {
          return getTextFromYXmlText(yNode);
        })
        .join(''),
    );
    return INSERTED;
  }
  return xmlText.length;
}

function getTextFromYXmlText(yXmlText) {
  let text = '';
  // hack to get text from YXmlText
  yXmlText.doc = new Y.Doc();
  yXmlText._pending.forEach(function (fn) {
    fn();
  });
  forEachTypeArray(yXmlText, function (item) {
    if (item.content.constructor === Y.ContentString) {
      text += item.content.str;
    }
  });
  return text;
}

function getNodeSize(type, schema) {
  if (type.constructor === Y.XmlText) {
    return type.length;
  }
  if (type.constructor === Y.XmlElement) {
    if (schema.nodes[type.nodeName].isLeaf) {
      return 1;
    }
    return 2 + getNodeSizeFromXmlFragment(type, schema);
  }
  if (type.constructor === Y.XmlFragment) {
    return getNodeSizeFromXmlFragment(type, schema);
  }
}

function getNodeSizeFromXmlFragment(xmlFragment, schema) {
  let childNodeSize = 0;
  forEachTypeArray(xmlFragment, function (item) {
    childNodeSize += getNodeSize(item.content.type, schema);
  });
  return childNodeSize;
}

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
  forEachTypeArray(xmlFragment, function (item) {
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
  });
  return { removedLength, totalLength };
}

export function remove(xmlFragment, schema, absPos, length) {
  console.assert(typeof absPos === 'number' && typeof length === 'number');
  removeFromTypeArray(xmlFragment, schema, absPos, length);
}

export function p2y(pDoc, type) {
  console.assert(pDoc.type.name === 'doc');
  Y.transact(
    type.doc,
    function () {
      p2yInsertIntoFragment(pDoc.content, type);
    },
    'local',
  );
}

function p2yInsertIntoFragment(fragment, yFragment) {
  const yNodes = p2yFragment(fragment);
  yFragment.insert(0, yNodes);
}

function p2yFragment(fragment) {
  return fragment.content.map(function (node) {
    return p2yNode(node);
  });
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
  const yText = new Y.XmlText();
  yText.insert(0, textNode.text);
  textNode.marks.forEach(function (mark) {
    yText.format(0, textNode.nodeSize, { [mark.type.name]: mark.attrs });
  });
  return yText;
}

function forEachTypeArray(array, f) {
  let item = array._start;
  while (item) {
    if (!item.deleted) {
      const res = f(item);
      if (res === SIGNALS.BREAK) {
        return res;
      }
    }
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

export function y2p(xmlFragment, schema) {
  const fragment = y2pFragment(xmlFragment, schema);
  return schema.node('doc', null, fragment);
}

function y2pFragment(type, schema) {
  let fragment = Fragment.empty;
  forEachTypeArray(type, function (item) {
    if (item.content.constructor === Y.ContentType) {
      if (item.content.type.constructor === Y.XmlElement) {
        const node = y2pElement(item.content.type, schema);
        fragment = fragment.addToEnd(node);
      } else if (item.content.type.constructor === Y.XmlText) {
        const nodes = y2pText(item.content.type, schema);
        nodes.forEach(function (node) {
          fragment = fragment.addToEnd(node);
        });
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
  const fragment = y2pFragment(type, schema);
  return schema.node(nodeName, attrs, fragment);
}

function attributesToMarks(attributes, schema) {
  return Object.keys(attributes).map(function (key) {
    return schema.mark(key, attributes[key]);
  });
}

function y2pText(type, schema) {
  const textNodes = [];
  let text = '';
  const attributes = {};
  forEachTypeArray(type, function (item) {
    if (item.content.constructor === Y.ContentFormat) {
      textNodes.push(schema.text(text, attributesToMarks(attributes, schema)));
      if (item.content.value === null) {
        delete attributes[item.content.key];
      } else {
        attributes[item.content.key] = item.content.value;
      }
      text = '';
    } else if (item.content.constructor === Y.ContentString) {
      text += item.content.str;
    }
  });
  if (text) {
    textNodes.push(schema.text(text));
  }
  return textNodes;
}

export function format(type, schema, from, to, mark) {
  formatXmlFragment(type, schema, from, to, mark);
}

function formatXmlFragment(xmlFragment, schema, from, to, attributes) {
  let length = 0;
  forEachTypeArray(xmlFragment, function (item) {
    if (item.content.constructor === Y.ContentType) {
      if (item.content.type.constructor === Y.XmlElement) {
        if (schema.nodes[item.content.type.nodeName].isLeaf) {
          length += 1;
        } else {
          length += 1;
          length += formatXmlFragment(
            item.content.type,
            schema,
            from - length,
            to - length,
            attributes,
          );
          length += 1;
        }
      } else if (item.content.type.constructor === Y.XmlText) {
        length += formatXmlText(
          item.content.type,
          schema,
          from,
          to,
          attributes,
        );
      } else {
        throw errors.unexpected();
      }
    }
    if (length > to) {
      return SIGNALS.BREAK;
    }
  });
  return length;
}

function formatXmlText(xmlText, schema, from, to, attributes) {
  xmlText.format(from, to - from, attributes);
  return xmlText.length;
}
