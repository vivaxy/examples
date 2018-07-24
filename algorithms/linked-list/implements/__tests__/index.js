/**
 * @since 20180719 11:51
 * @author vivaxy
 */

const test = require('ava');
const LinkedList = require('../index.js');

test('Should create an empty linked list', (t) => {
  const linkedList = new LinkedList();
  t.is(linkedList.toString(), '');
});

test('Should add node to linked list', (t) => {
  const linkedList = new LinkedList();

  t.is(linkedList.head, null);
  t.is(linkedList.tail, null);

  linkedList.append(1);
  linkedList.append(2);

  t.is(linkedList.toString(), '1,2');
});

test('Should prepend node to linked list', (t) => {
  const linkedList = new LinkedList();

  linkedList.prepend(2);
  t.is(linkedList.head.value, 2);
  t.is(linkedList.tail.value, 2);

  linkedList.append(1);
  linkedList.prepend(3);

  t.is(linkedList.toString(), '3,2,1');
});

test('should delete node by value from linked list', (t) => {
  const linkedList = new LinkedList();

  t.is(linkedList.remove(5), null);

  linkedList.append(1);
  linkedList.append(1);
  linkedList.append(2);
  linkedList.append(3);
  linkedList.append(3);
  linkedList.append(3);
  linkedList.append(4);
  linkedList.append(5);

  t.is(linkedList.head.value, 1);
  t.is(linkedList.tail.value, 5);

  const deletedNodes = linkedList.remove(3);
  t.is(deletedNodes.map(node => node.value).join(','), '3,3,3');
  t.is(linkedList.toString(), '1,1,2,4,5');

  linkedList.remove(3);
  t.is(linkedList.toString(), '1,1,2,4,5');

  linkedList.remove(1);
  t.is(linkedList.toString(), '2,4,5');

  t.is(linkedList.head.value, 2);
  t.is(linkedList.tail.value, 5);

  linkedList.remove(5);
  t.is(linkedList.toString(), '2,4');

  t.is(linkedList.head.value, 2);
  t.is(linkedList.tail.value, 4);

  linkedList.remove(4);
  t.is(linkedList.toString(), '2');

  t.is(linkedList.head.value, 2);
  t.is(linkedList.tail.value, 2);

  linkedList.remove(2);
  t.is(linkedList.toString(), '');
});
