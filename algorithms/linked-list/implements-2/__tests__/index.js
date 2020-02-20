/**
 * @since 20180719 11:51
 * @author vivaxy
 */
const {
  createLinkedList,
  toString,
  append,
  prepend,
  remove,
  find,
} = require('..');

test('Should create an empty linked list', function() {
  const linkedList = createLinkedList();
  expect(toString(linkedList)).toBe('');
});

test('Should create a linked list', function() {
  const linkedList = createLinkedList(1, 2);
  expect(toString(linkedList)).toBe('1,2');
});

test('Should append to a linked list', function() {
  const linkedList = createLinkedList(1, 2);
  expect(toString(append(3, linkedList))).toBe('1,2,3');
});

test('Should prepend to a linked list', function() {
  const linkedList = createLinkedList(2, 3);
  expect(toString(prepend(1, linkedList))).toBe('1,2,3');
});

test('should remove node by value from linked list', function() {
  const linkedList = createLinkedList(1, 2, 3);
  expect(toString(remove(1, linkedList))).toBe('2,3');
  expect(toString(remove(2, linkedList))).toBe('1,3');
  expect(toString(remove(3, linkedList))).toBe('1,2');
  expect(toString(remove(4, linkedList))).toBe('1,2,3');

  const linkedList2 = createLinkedList(1, 2, 1, 3);
  expect(toString(remove(1, linkedList2))).toBe('2,3');
});

test('should find node by value in linked list', function() {
  const linkedList = createLinkedList(1, 2, 3);
  expect(toString(find(2, linkedList))).toBe('2,3');
});
