/**
 * @since 2021-10-13
 * @author vivaxy
 * @see https://en.wikipedia.org/wiki/Rope_(data_structure)
 */
const Rope = require('..');

describe('insert', function () {
  test('', function () {
    const rope = new Rope();
    rope.insert(0, 'a');
    rope.insert(1, 'b');
    expect(rope.text).toBe('ab');
  });
});

describe('index', function () {
  test('', function () {
    const rope = new Rope('abc');
    expect(rope.index(1)).toBe('b');
  });
});

describe('concat', function () {
  test('', function () {
    const rope1 = new Rope('a');
    const rope1OLength = rope1.length;
    const rope2 = new Rope('b');
    rope1.concat(rope2);
    expect(rope1.length).toBe(rope1OLength + rope2.length);
  });
});

describe('split', function () {
  test('split begin', function () {
    const rope = new Rope('ab');
    const rope2 = rope.split(0);
    expect(rope2.text).toBe('');
    expect(rope.text).toBe('ab');
  });

  test('split middle text', function () {
    const rope = new Rope('ab');
    const rope2 = rope.split(1);
    expect(rope2.text).toBe('b');
    expect(rope.text).toBe('a');
  });

  test('split middle node', function () {
    const rope = new Rope();
    rope.insert(0, 'a');
    rope.insert(1, 'b');
    const rope2 = rope.split(1);
    expect(rope.text).toBe('a');
    expect(rope2.text).toBe('b');
  });

  test('split middle node with right node', function () {
    const rope = new Rope();
    rope.insert(0, 'a');
    rope.insert(1, 'b');
    rope.insert(2, 'c');
    const rope2 = rope.split(1);
    expect(rope.text).toBe('a');
    expect(rope2.text).toBe('bc');
  });

  test('split middle node with right node 2', function () {
    const rope = new Rope();
    rope.insert(0, 'ab');
    rope.insert(2, 'c');
    const rope2 = rope.split(1);
    expect(rope.text).toBe('a');
    expect(rope2.text).toBe('bc');
  });

  test('split end', function () {
    const rope = new Rope('ab');
    const rope2 = rope.split(2);
    expect(rope2.text).toBe('');
    expect(rope.text).toBe('ab');
  });
});

describe('delete', function () {
  test('', function () {
    const rope = new Rope('abc');
    rope.delete(1, 1);
    expect(rope.text).toBe('ac');
  });
});
