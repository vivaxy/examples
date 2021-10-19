/**
 * @since 2021-10-13
 * @author vivaxy
 */
const errors = {
  indexOutOfBound(input, min, max) {
    return new Error(
      `Index out of bound. Actual ${input}. Accept ${min}~${max}`,
    );
  },
};

class RopeNode {
  constructor(text = '') {
    this.text = text;
    this.left = null;
    this.right = null;
  }

  set text(text) {
    this._text = text;
    this.length = text.length;
  }

  get text() {
    if (this._text) {
      return this._text;
    }
    let text = '';
    if (this.left) {
      text += this.left.text;
    }
    if (this.right) {
      text += this.right.text;
    }
    return text;
  }
}

function findIndex(node, index) {
  if (node.length <= index) {
    throw errors.indexOutOfBound(index, 0, node.length - 1);
  }
  if (node.left && node.left.length > index) {
    return findIndex(node.left, index);
  }
  if (node.right) {
    return findIndex(node.right, index - node.left.length);
  }
  return node.text[index];
}

function concat(node1, node2) {
  // node1 / 2 ~ node1 * 2
  if (node2.length < node1.length / 2 && node1.right) {
    // node2 too small, append to node1 leaf
    node1.right = concat(node1.right, node2);
    node1.length = node1.left.length + node1.right.length;
    return node1;
  }
  if (node2.length > node1.length * 2 && node2.left) {
    // node2 too large, append node1 to node2 leaf
    node2.left = concat(node1, node2.left);
    node2.length = node2.left.length + node2.right.length;
    return node2;
  }
  const node = new RopeNode();
  node.left = node1;
  node.right = node2;
  node.length = node1.length + node2.length;
  return node;
}

function split(node, index) {
  if (index === 0) {
    return [new RopeNode(), node];
  }
  if (node.length < index) {
    throw errors.indexOutOfBound(index, 0, node.length);
  }
  if (node.length === index) {
    return [node, new RopeNode()];
  }
  if (node.left && node.left.length === index) {
    const newNode = node.right;
    node.length -= node.right.length;
    node.right = null;
    return [node, newNode];
  }

  if (node.left && node.left.length > index) {
    // split left
    const [, newNodeFromLeft] = split(node.left, index);
    node.length = node.left.length;
    // and split right
    const newNode = new RopeNode();
    newNode.left = newNodeFromLeft;
    newNode.right = node.right;
    newNode.length = newNodeFromLeft.length + newNode.right.length;
    node.right = null;
    return [node, newNode];
  }
  if (node.right) {
    const [, newNode] = split(node.right, index - node.left.length);
    node.length = node.left.length + node.right.length;
    return [node, newNode];
  }
  const oText = node.text;
  node.text = oText.slice(0, index);
  return [node, new RopeNode(oText.slice(index))];
}

function insert(node, index, text) {
  const newNode = new RopeNode(text);
  const [leftNode, rightNode] = split(node, index);
  const newNode1 = concat(leftNode, newNode);
  return concat(newNode1, rightNode);
}

function remove(node, index, length) {
  const [leftNode, node0] = split(node, index);
  const [, rightNode] = split(node0, length);
  return concat(leftNode, rightNode);
}

module.exports = class Rope {
  constructor(text) {
    this.root = new RopeNode(text);
  }

  get text() {
    return this.root.text;
  }

  get length() {
    return this.root.length;
  }

  insert(index, text) {
    this.root = insert(this.root, index, text);
  }

  index(index) {
    return findIndex(this.root, index);
  }

  concat(otherRope) {
    this.root = concat(this.root, otherRope.root);
  }

  split(index) {
    const [node1, node2] = split(this.root, index);
    if (node1 === this.root) {
      return node2;
    }
    return node1;
  }

  delete(index, length) {
    this.root = remove(this.root, index, length);
  }
};
