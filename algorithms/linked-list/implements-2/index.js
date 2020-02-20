/**
 * @since 20200220 11:40
 * @author vivaxy
 */
function createNode(val, node) {
  return function(flag) {
    if (flag) {
      return val;
    }
    return node;
  };
}

function getValue(node) {
  return node(true);
}

function getNext(node) {
  return node(false);
}

function toJS(node) {
  if (node === null) {
    return [];
  }
  return [getValue(node), ...toJS(getNext(node))];
}

function toString(node) {
  if (node === null) {
    return '';
  }
  const next = getNext(node);
  if (next === null) {
    return getValue(node);
  }
  return getValue(node) + ',' + toString(getNext(node));
}

function prepend(val, node) {
  return createNode(val, node);
}

function append(val, node) {
  if (node === null) {
    return prepend(val, null);
  }
  return prepend(getValue(node), append(val, getNext(node)));
}

function createLinkedList(...values) {
  if (values.length === 0) {
    return null;
  }
  if (values.length === 1) {
    return prepend(values[0], null);
  }
  const [val, ...rest] = values;
  return prepend(val, createLinkedList(...rest));
}

function find(val, node) {
  if (node === null) {
    return null;
  }
  if (getValue(node) === val) {
    return node;
  }
  return find(val, getNext(node));
}

function remove(val, node) {
  if (node === null) {
    return null;
  }
  if (getValue(node) === val) {
    return remove(val, getNext(node));
  }
  return prepend(getValue(node), remove(val, getNext(node)));
}

function insert(val, target, linkedList) {
  if (getValue(linkedList) === target) {
    return prepend(val, linkedList);
  }
  return prepend(
    getValue(linkedList),
    insert(val, target, getNext(linkedList)),
  );
}

exports.getValue = getValue;
exports.getNext = getNext;
exports.toJS = toJS;
exports.toString = toString;
exports.prepend = prepend;
exports.append = append;
exports.createLinkedList = createLinkedList;
exports.remove = remove;
exports.find = find;
exports.insert = insert;
