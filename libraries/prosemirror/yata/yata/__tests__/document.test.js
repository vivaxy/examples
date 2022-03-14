import { Position, Document } from '../document.js';
import { Item } from '../item.js';

const emptyDoc = new Document();

describe('document', function () {
  test('replaceItems with empty doc', function () {
    const doc = new Document();
    doc.replaceItems(0, 0, [new Item()]);
    expect(doc.head.id.client).toBe(doc.client);
    expect(doc.head.id.clock).toBe(0);
  });
});

describe('position', function () {
  test('should work with empty doc', function () {
    const pos = new Position(emptyDoc);
    expect(pos.pos).toBe(0);
    expect(function () {
      pos.forward();
    }).toThrow('Unexpected position 1');
  });

  test('should forward', function () {
    const doc = new Document();
    doc.replaceItems(0, 0, [new Item()]);
  });
});
