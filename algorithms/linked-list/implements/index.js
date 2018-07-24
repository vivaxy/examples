/**
 * @since 20180719 11:40
 * @author vivaxy
 */

module.exports = class LinkedList {

  constructor() {
    this.head = null;
    this.tail = null;
  }

  prepend(value) {
    const node = new Node(value);
    node.next = this.head;
    this.head = node;

    if (!this.tail) {
      this.tail = node;
    }

    return this;
  }

  append(value) {
    const node = new Node(value);

    if (!this.head) {
      this.head = node;
      this.tail = node;
    } else {
      this.tail.next = node;
      this.tail = node;
    }

    return this;
  }

  // remove all nodes that is value
  remove(value) {
    if (!this.head) {
      return null;
    }

    let prevNode = null;
    let currentNode = this.head;
    let removedNodes = [];

    while (currentNode) {
      if (currentNode.value === value) {
        // do remove
        const nextNode = this.removeNode(prevNode, currentNode);
        removedNodes.push(currentNode);
        currentNode = nextNode;
      } else {
        prevNode = currentNode;
        currentNode = currentNode.next;
      }
    }

    return removedNodes;
  }

  removeNode(prevNode, node) {
    if (!node) {
      return this;
    }

    let nextNode = null;

    if (node === this.head) {
      this.head = node.next;
      node.next = null;
      nextNode = this.head;
    } else if (node === this.tail) {
      this.tail = prevNode;
      prevNode.next = null;
      nextNode = null;
    } else {
      prevNode.next = node.next;
      node.next = null;
      nextNode = prevNode.next;
    }
    return nextNode;
  }

  find(value) {
    if (!this.head) {
      return null;
    }

    let currentNode = this.head;
    while (currentNode) {
      if (currentNode.value === value) {
        return currentNode;
      }

      currentNode = currentNode.next;
    }

    return null;
  }

  toString() {
    let currentNode = this.head;
    let nodeValues = [];
    while (currentNode) {
      nodeValues.push(currentNode.value);
      currentNode = currentNode.next;
    }
    return nodeValues.join(',');
  }

};

class Node {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}
