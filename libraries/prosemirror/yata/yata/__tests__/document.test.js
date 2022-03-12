import { Position, Document } from '../document';
import { Item } from '../item.js';

const emptyDoc = new Document();

describe('document', () => {
  test('replaceItems with empty doc', () => {
    const doc = new Document();
    doc.replaceItems(0, 0, [new Item()]);
    expect(doc.head.id.client).toBe(doc.client);
    expect(doc.head.id.clock).toBe(0);
  });
});

describe('position', () => {
  test('should work with empty doc', () => {
    const pos = new Position(emptyDoc);
    expect(pos.pos).toBe(0);
    expect(() => {
      pos.forward();
    }).toThrow('Unexpected position 1');
  });

  test('should forward', () => {
    const doc = new Document();
    doc.replaceItems(0, 0, [new Item()]);
  });
});
