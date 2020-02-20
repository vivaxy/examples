/**
 * @since 20180719 11:40
 * @author vivaxy
 */
function prepend(val, node) {
  return function(flag) {
    if (flag) {
      return val;
    }
    return node;
  };
}

function append(val, node) {
  if (node === null) {
    return prepend(val, null);
  }
  return prepend(getValue(node), append(val, getNext(node)));
}

function getValue(node) {
  return node(true);
}

function getNext(node) {
  return node(false);
}

function createLinkedList(...values) {
  return values.reduceRight(function(next, val) {
    return prepend(val, next);
  }, null);
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

function remove(val, node) {
  if (node === null) {
    return null;
  }
  if (getValue(node) === val) {
    return getNext(node);
  }
  return prepend(getValue(node), remove(val, getNext(node)));
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

exports.prepend = prepend;
exports.append = append;
exports.getValue = getValue;
exports.getNext = getNext;
exports.createLinkedList = createLinkedList;
exports.toString = toString;
exports.remove = remove;
exports.find = find;
