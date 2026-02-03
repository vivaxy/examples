import { describe, test, expect } from 'vitest';
import { Fragment, Slice } from 'prosemirror-model';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';
import schema from '../../example/schema.js';
import {
  nodeToItems,
  OpeningTagItem,
  ClosingTagItem,
  itemsToSlice,
  TextItem,
  NodeItem,
  sliceToItems,
  Item,
  SetAttrItem,
} from '../item.js';
import { Document, Position } from '../document.js';
import {
  createEmptyDoc,
  createDocWithText,
  createDocWithParagraph,
  createTextItems,
  createParagraphItems,
  expectItemId,
  expectItemsLinked,
} from './helpers/test-helpers.js';

// ============================================================================
// Phase 2: CRDT Core Primitives
// ============================================================================

describe('Item.greaterThan() - CRDT Ordering', function () {
  test('same client, different clocks - higher clock is greater', function () {
    const doc = createEmptyDoc('client1');
    const item1 = new TextItem('a');
    const item2 = new TextItem('b');
    const pos = new Position(doc);
    item1.integrate(pos);
    item2.integrate(pos);

    expect(item2.greaterThan(item1)).toBe(true);
    expect(item1.greaterThan(item2)).toBe(false);
  });

  test('same client, same clock - not greater', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'client1', clock: 5 };
    const item2 = new TextItem('b');
    item2.id = { client: 'client1', clock: 5 };

    expect(item1.greaterThan(item2)).toBe(false);
    expect(item2.greaterThan(item1)).toBe(false);
  });

  test('different clients - lexicographically greater client wins', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'client-a', clock: 10 };
    const item2 = new TextItem('b');
    item2.id = { client: 'client-b', clock: 5 };

    expect(item2.greaterThan(item1)).toBe(true);
    expect(item1.greaterThan(item2)).toBe(false);
  });

  test('different clients - numeric client IDs', function () {
    const item1 = new TextItem('a');
    item1.id = { client: '1', clock: 100 };
    const item2 = new TextItem('b');
    item2.id = { client: '2', clock: 1 };

    expect(item2.greaterThan(item1)).toBe(true);
    expect(item1.greaterThan(item2)).toBe(false);
  });

  test('self-comparison returns false', function () {
    const item = new TextItem('a');
    item.id = { client: 'client1', clock: 5 };

    expect(item.greaterThan(item)).toBe(false);
  });

  test('clock=0 is valid and can be compared', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'client1', clock: 0 };
    const item2 = new TextItem('b');
    item2.id = { client: 'client1', clock: 1 };

    expect(item2.greaterThan(item1)).toBe(true);
    expect(item1.greaterThan(item2)).toBe(false);
  });

  test('large clock values work correctly', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'client1', clock: 999999 };
    const item2 = new TextItem('b');
    item2.id = { client: 'client1', clock: 1000000 };

    expect(item2.greaterThan(item1)).toBe(true);
  });

  test('transitivity: if a > b and b > c, then a > c', function () {
    const itemA = new TextItem('a');
    itemA.id = { client: 'client1', clock: 3 };
    const itemB = new TextItem('b');
    itemB.id = { client: 'client1', clock: 2 };
    const itemC = new TextItem('c');
    itemC.id = { client: 'client1', clock: 1 };

    expect(itemA.greaterThan(itemB)).toBe(true);
    expect(itemB.greaterThan(itemC)).toBe(true);
    expect(itemA.greaterThan(itemC)).toBe(true);
  });

  test('consistency: multiple comparisons yield same result', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'alpha', clock: 5 };
    const item2 = new TextItem('b');
    item2.id = { client: 'beta', clock: 3 };

    const result1 = item2.greaterThan(item1);
    const result2 = item2.greaterThan(item1);
    const result3 = item2.greaterThan(item1);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
  });

  test('antisymmetry: if a > b then b cannot be > a', function () {
    const item1 = new TextItem('a');
    item1.id = { client: 'client1', clock: 1 };
    const item2 = new TextItem('b');
    item2.id = { client: 'client1', clock: 2 };

    if (item2.greaterThan(item1)) {
      expect(item1.greaterThan(item2)).toBe(false);
    }
  });
});

describe('Item.putIntoDocument() - Out-of-order Integration', function () {
  test('already integrated items return early', function () {
    const doc = createDocWithText('abc');
    const firstItem = doc.head!;

    const result = firstItem.putIntoDocument(doc);
    expect(result).toBeUndefined();
  });

  test('empty document - sets head with only originalRight', function () {
    const doc = createEmptyDoc('client1');

    const item = new TextItem('a');
    item.id = { client: 'client2', clock: 0 };
    item.originalLeft = null;
    item.originalRight = { client: 'someClient', clock: 0 }; // reference to non-existent future item

    const pos = item.putIntoDocument(doc);
    expect(doc.head).toBe(item);
    expect(pos).toBeDefined();
  });

  test('normal integration inserts item between originalLeft and right', function () {
    const doc = createDocWithText('ac', 'client1');
    const items = doc.toArray();
    const itemA = items[0] as TextItem;
    const itemC = items[1] as TextItem;

    const itemB = new TextItem('b');
    itemB.id = { client: 'client2', clock: 0 };
    itemB.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    itemB.originalRight = null;

    itemB.putIntoDocument(doc);

    const allItems = doc.toArray() as TextItem[];
    expect(allItems.length).toBe(3);
    expect(allItems[0].text).toBe('a');
    // Both 'b' and 'c' have originalLeft='a', so they're ordered by client ID
    // client1 < client2, so 'c' comes before 'b'
    expect(allItems[1].text).toBe('c');
    expect(allItems[2].text).toBe('b');
  });

  test('out-of-order insertion - CRDT conflict resolution', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const itemA = new TextItem('a');
    itemA.integrate(pos);

    const itemB1 = new TextItem('1');
    itemB1.id = { client: 'client2', clock: 0 };
    itemB1.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    itemB1.originalRight = null;

    const itemB2 = new TextItem('2');
    itemB2.id = { client: 'client3', clock: 0 };
    itemB2.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    itemB2.originalRight = null;

    itemB1.putIntoDocument(doc);
    itemB2.putIntoDocument(doc);

    const items = doc.toArray() as TextItem[];
    expect(items[0].text).toBe('a');
    expect(items[1].text).toBe('1');
    expect(items[2].text).toBe('2');
  });

  test('concurrent operations from multiple clients converge', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const base = new TextItem('X');
    base.integrate(pos);

    const item1 = new TextItem('1');
    item1.id = { client: 'alice', clock: 0 };
    item1.originalLeft = { client: base.id!.client, clock: base.id!.clock };
    item1.originalRight = null;

    const item2 = new TextItem('2');
    item2.id = { client: 'bob', clock: 0 };
    item2.originalLeft = { client: base.id!.client, clock: base.id!.clock };
    item2.originalRight = null;

    const item3 = new TextItem('3');
    item3.id = { client: 'charlie', clock: 0 };
    item3.originalLeft = { client: base.id!.client, clock: base.id!.clock };
    item3.originalRight = null;

    item1.putIntoDocument(doc);
    item2.putIntoDocument(doc);
    item3.putIntoDocument(doc);

    const items = doc.toArray() as TextItem[];
    expect(items.map((i) => i.text).join('')).toBe('X123');
    expect(items[1].id!.client).toBe('alice');
    expect(items[2].id!.client).toBe('bob');
    expect(items[3].id!.client).toBe('charlie');
  });

  test('integration scans right when originalLeft has multiple right neighbors', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const itemA = new TextItem('a');
    itemA.integrate(pos);

    const item1 = new TextItem('1');
    item1.id = { client: 'client-aaa', clock: 0 };
    item1.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    item1.originalRight = null;
    item1.putIntoDocument(doc);

    const item2 = new TextItem('2');
    item2.id = { client: 'client-zzz', clock: 0 };
    item2.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    item2.originalRight = null;
    item2.putIntoDocument(doc);

    const items = doc.toArray() as TextItem[];
    expect(items[0].text).toBe('a');
    expect(items[1].text).toBe('1');
    expect(items[2].text).toBe('2');
  });

  test('integration with deleted items in the chain', function () {
    const doc = createDocWithText('abc', 'client1');
    const items = doc.toArray();
    const itemB = items[1];
    itemB.delete();

    const itemX = new TextItem('x');
    itemX.id = { client: 'client2', clock: 0 };
    itemX.originalLeft = {
      client: items[0].id!.client,
      clock: items[0].id!.clock,
    };
    itemX.originalRight = {
      client: items[2].id!.client,
      clock: items[2].id!.clock,
    };

    itemX.putIntoDocument(doc);

    const allItems = doc.toArray() as TextItem[];
    expect(allItems.length).toBe(4);
    expect(
      allItems
        .filter((i) => !i.deleted)
        .map((i) => i.text)
        .join(''),
    ).toBe('axc');
  });

  test('integration finds correct position when scanning', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const itemA = new TextItem('a');
    itemA.integrate(pos);

    const item1 = new TextItem('1');
    item1.id = { client: 'aaa', clock: 1 };
    item1.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    item1.originalRight = null;
    item1.putIntoDocument(doc);

    const item2 = new TextItem('2');
    item2.id = { client: 'bbb', clock: 1 };
    item2.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    item2.originalRight = null;
    item2.putIntoDocument(doc);

    const item3 = new TextItem('3');
    item3.id = { client: 'ccc', clock: 1 };
    item3.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
    item3.originalRight = null;
    item3.putIntoDocument(doc);

    const items = doc.toArray() as TextItem[];
    expect(items.map((i) => i.text).join('')).toBe('a123');
    expect(items[1].id!.client).toBe('aaa');
    expect(items[2].id!.client).toBe('bbb');
    expect(items[3].id!.client).toBe('ccc');
  });

  test('integration with only originalRight (no originalLeft)', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const itemB = new TextItem('b');
    itemB.integrate(pos);

    const itemA = new TextItem('a');
    itemA.id = { client: 'client2', clock: 0 };
    itemA.originalLeft = null;
    itemA.originalRight = { client: itemB.id!.client, clock: itemB.id!.clock };

    const result = itemA.putIntoDocument(doc);
    expect(doc.head).toBe(itemA);
    expect(result).toBeDefined();
  });

  test('multiple items with same originalLeft integrate in order', function () {
    const doc = createDocWithText('a', 'client1');
    const itemA = doc.head!;

    const items: TextItem[] = [];
    for (let i = 0; i < 5; i++) {
      const item = new TextItem(String(i));
      item.id = { client: `client-${i}`, clock: 0 };
      item.originalLeft = { client: itemA.id!.client, clock: itemA.id!.clock };
      item.originalRight = null;
      items.push(item);
    }

    items.forEach((item) => item.putIntoDocument(doc));

    const allItems = doc.toArray() as TextItem[];
    expect(allItems[0].text).toBe('a');
    for (let i = 0; i < 5; i++) {
      expect(allItems[i + 1].text).toBe(String(i));
    }
  });

  test('integration respects CRDT ordering during scan', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const base = new TextItem('_');
    base.integrate(pos);

    const highPriority = new TextItem('H');
    highPriority.id = { client: 'zzz', clock: 0 };
    highPriority.originalLeft = {
      client: base.id!.client,
      clock: base.id!.clock,
    };
    highPriority.originalRight = null;

    const lowPriority = new TextItem('L');
    lowPriority.id = { client: 'aaa', clock: 0 };
    lowPriority.originalLeft = {
      client: base.id!.client,
      clock: base.id!.clock,
    };
    lowPriority.originalRight = null;

    lowPriority.putIntoDocument(doc);
    highPriority.putIntoDocument(doc);

    const items = doc.toArray() as TextItem[];
    expect(items[1].text).toBe('L');
    expect(items[2].text).toBe('H');
  });

  test('integration with complex chain of items', function () {
    const doc = createDocWithText('abcde', 'client1');
    const items = doc.toArray();

    const itemX = new TextItem('X');
    itemX.id = { client: 'client2', clock: 0 };
    itemX.originalLeft = {
      client: items[1].id!.client,
      clock: items[1].id!.clock,
    }; // after 'b'
    itemX.originalRight = {
      client: items[2].id!.client,
      clock: items[2].id!.clock,
    }; // before 'c'

    itemX.putIntoDocument(doc);

    const result = doc
      .toArray()
      .map((i) => (i as TextItem).text)
      .join('');
    // X has originalRight='c', which is a hard boundary constraint
    // X must be placed before 'c', respecting its original insertion position
    // originalRight takes precedence over YATA client ID ordering
    expect(result).toBe('abXcde');
  });
});

describe('Item.insertIntoPosition() - Linked List Manipulation', function () {
  test('insert into empty document', function () {
    const doc = createEmptyDoc();
    const pos = new Position(doc);
    const item = new TextItem('a');

    item.insertIntoPosition(pos);

    expect(doc.head).toBe(item);
    expect(item.left).toBeNull();
    expect(item.right).toBeNull();
    expect(pos.left).toBe(item);
  });

  test('insert at head of non-empty document', function () {
    const doc = createDocWithText('b');
    const existingItem = doc.head!;
    const pos = new Position(doc);

    const newItem = new TextItem('a');
    newItem.insertIntoPosition(pos);

    expect(doc.head).toBe(newItem);
    expect(newItem.left).toBeNull();
    expect(newItem.right).toBe(existingItem);
    expect(existingItem.left).toBe(newItem);
  });

  test('insert in middle of document', function () {
    const doc = createDocWithText('ac');
    const items = doc.toArray();
    const itemA = items[0];
    const itemC = items[1];

    const pos = new Position(doc);
    pos.forward(); // After 'a'

    const itemB = new TextItem('b');
    itemB.insertIntoPosition(pos);

    expect(itemA.right).toBe(itemB);
    expect(itemB.left).toBe(itemA);
    expect(itemB.right).toBe(itemC);
    expect(itemC.left).toBe(itemB);
  });

  test('insert at tail of document', function () {
    const doc = createDocWithText('ab');
    const items = doc.toArray();
    const itemB = items[1];

    const pos = new Position(doc);
    pos.forward();
    pos.forward();

    const itemC = new TextItem('c');
    itemC.insertIntoPosition(pos);

    expect(itemB.right).toBe(itemC);
    expect(itemC.left).toBe(itemB);
    expect(itemC.right).toBeNull();
  });

  test('bidirectional pointers are updated correctly', function () {
    const doc = createDocWithText('ac');
    const pos = new Position(doc);
    pos.forward();

    const itemB = new TextItem('b');
    itemB.insertIntoPosition(pos);

    const items = doc.toArray();
    for (let i = 0; i < items.length - 1; i++) {
      expect(items[i].right).toBe(items[i + 1]);
      expect(items[i + 1].left).toBe(items[i]);
    }
  });

  test('position state is updated after insertion', function () {
    const doc = createDocWithText('a');
    const oldHead = doc.head!;
    const pos = new Position(doc);

    const item = new TextItem('b');
    item.insertIntoPosition(pos);

    expect(pos.left).toBe(item);
    expect(pos.right).toBe(oldHead); // pos.right is still the old head 'a'
    expect(doc.head).toBe(item); // doc.head is now 'b'
  });

  test('multiple consecutive insertions at same position', function () {
    const doc = createEmptyDoc();
    const pos = new Position(doc);

    const item1 = new TextItem('1');
    item1.insertIntoPosition(pos);

    const item2 = new TextItem('2');
    item2.insertIntoPosition(pos);

    const item3 = new TextItem('3');
    item3.insertIntoPosition(pos);

    const items = doc.toArray() as TextItem[];
    expect(items.length).toBe(3);
    expect(items[0].text).toBe('1');
    expect(items[1].text).toBe('2');
    expect(items[2].text).toBe('3');
  });

  test('insertion preserves document integrity', function () {
    const doc = createDocWithText('ace');
    const pos = new Position(doc);

    pos.forward(); // After 'a'
    const itemB = new TextItem('b');
    itemB.insertIntoPosition(pos);

    pos.forward(); // After 'b', now at 'c'
    const itemD = new TextItem('d');
    itemD.insertIntoPosition(pos);

    const result = doc
      .toArray()
      .map((i) => (i as TextItem).text)
      .join('');
    expect(result).toBe('abcde');
  });
});

describe('Item.integrateInner() - ID and Relationship Setup', function () {
  test('assigns ID with client and clock', function () {
    const doc = createEmptyDoc('test-client');
    doc.clock = 5;

    const item = new TextItem('a');
    item.integrateInner(doc, null, null);

    expect(item.id!.client).toBe('test-client');
    expect(item.id!.clock).toBe(5);
  });

  test('increments document clock', function () {
    const doc = createEmptyDoc('client1');
    doc.clock = 10;

    const item = new TextItem('a');
    item.integrateInner(doc, null, null);

    expect(doc.clock).toBe(11);
  });

  test('sets originalLeft when provided', function () {
    const doc = createEmptyDoc();
    const leftItem = new TextItem('a');
    leftItem.id = { client: 'client1', clock: 0 };

    const item = new TextItem('b');
    item.integrateInner(doc, leftItem, null);

    expect(item.originalLeft).toEqual(leftItem.id);
  });

  test('sets originalRight when provided', function () {
    const doc = createEmptyDoc();
    const rightItem = new TextItem('c');
    rightItem.id = { client: 'client1', clock: 1 };

    const item = new TextItem('b');
    item.integrateInner(doc, null, rightItem);

    expect(item.originalRight).toEqual(rightItem.id);
  });

  test('creates bidirectional originalRight link', function () {
    const doc = createEmptyDoc();
    const leftItem = new TextItem('a');
    leftItem.id = { client: 'client1', clock: 0 };

    const item = new TextItem('b');
    item.integrateInner(doc, leftItem, null);

    expect(leftItem.originalRight).toEqual(item.id);
  });

  test('creates bidirectional originalLeft link', function () {
    const doc = createEmptyDoc();
    const rightItem = new TextItem('c');
    rightItem.id = { client: 'client1', clock: 1 };

    const item = new TextItem('b');
    item.integrateInner(doc, null, rightItem);

    expect(rightItem.originalLeft).toEqual(item.id);
  });

  test('preserves existing originalLeft if already set', function () {
    const doc = createEmptyDoc();
    const existingLeft = new TextItem('x');
    existingLeft.id = { client: 'client1', clock: 0 };

    const item = new TextItem('b');
    item.originalLeft = existingLeft.id;

    const newLeft = new TextItem('a');
    newLeft.id = { client: 'client1', clock: 1 };

    item.integrateInner(doc, newLeft, null);

    expect(item.originalLeft).toEqual(existingLeft.id);
  });

  test('preserves existing originalRight if already set', function () {
    const doc = createEmptyDoc();
    const existingRight = new TextItem('z');
    existingRight.id = { client: 'client1', clock: 2 };

    const item = new TextItem('b');
    item.originalRight = existingRight.id;

    const newRight = new TextItem('c');
    newRight.id = { client: 'client1', clock: 1 };

    item.integrateInner(doc, null, newRight);

    expect(item.originalRight).toEqual(existingRight.id);
  });

  test('handles null left and right neighbors', function () {
    const doc = createEmptyDoc();
    const item = new TextItem('a');

    item.integrateInner(doc, null, null);

    expect(item.originalLeft).toBeNull();
    expect(item.originalRight).toBeNull();
    expect(item.id).toBeDefined();
  });

  test('sets up relationships in sequence', function () {
    const doc = createEmptyDoc('client1');
    const pos = new Position(doc);

    const item1 = new TextItem('a');
    item1.integrateInner(doc, null, null);

    const item2 = new TextItem('b');
    item2.integrateInner(doc, item1, null);

    const item3 = new TextItem('c');
    item3.integrateInner(doc, item2, null);

    expect(item1.originalRight).toEqual(item2.id);
    expect(item2.originalLeft).toEqual(item1.id);
    expect(item2.originalRight).toEqual(item3.id);
    expect(item3.originalLeft).toEqual(item2.id);
  });
});

// ============================================================================
// Original Tests (kept for backward compatibility)
// ============================================================================

describe('nodeToItems', function () {
  test('all nodes', function () {
    const node = schema.node('paragraph', null, [
      schema.text('123', [schema.mark('em')]),
      schema.node('image', { src: 'a' }),
    ]);
    const items = nodeToItems(node);
    expect(items.length).toBe(node.nodeSize);
  });
});

describe('itemsToSlice and fragmentToItems', function () {
  test('all items', function () {
    const items = [
      new OpeningTagItem('paragraph', null),
      new TextItem('1'),
      new TextItem('2'),
      new NodeItem('image', { src: 'a' }),
      new ClosingTagItem('paragraph'),
    ];
    const slice = itemsToSlice(items, schema);
    expect(slice.content.toJSON()).toStrictEqual(
      Fragment.from([
        schema.node('paragraph', null, [
          schema.text('12'),
          schema.node('image', { src: 'a' }),
        ]),
      ]).toJSON(),
    );
    expect(slice.size).toBe(items.length);
  });
});

describe('sliceToItems', () => {
  test('all nodes', () => {
    const node = schema.node('paragraph', null, [
      schema.text('123', [schema.mark('em')]),
      schema.node('image', { src: 'a' }),
    ]);
    const slice = new Slice(
      Fragment.from([schema.node('paragraph'), node]),
      1,
      0,
    );
    const items = sliceToItems(slice);
    expect(items.length).toBe(slice.size);
  });
});

describe('itemsToSlice', () => {
  test('all items', () => {
    const items = [
      new TextItem('1'),
      new TextItem('2'),
      new NodeItem('image', { src: 'a' }),
      new ClosingTagItem('paragraph'),
    ];
    const slice = itemsToSlice(items, schema);
    expect(slice.toJSON()).toStrictEqual(
      new Slice(
        Fragment.from([
          schema.node('paragraph', null, [
            schema.text('12'),
            schema.node('image', { src: 'a' }),
          ]),
        ]),
        1,
        0,
      ).toJSON(),
    );
    expect(slice.size).toBe(items.length);
  });

  test('adjacent ClosingTagItem + OpeningTagItem without nesting', () => {
    // Arrange
    const items = [
      new ClosingTagItem('paragraph'),
      new OpeningTagItem('paragraph', null),
      new TextItem('a'),
      new ClosingTagItem('paragraph'),
    ];

    // Act
    const slice = itemsToSlice(items, schema);

    // Assert
    expect(slice.openStart).toBe(1); // First paragraph is orphaned
    expect(slice.openEnd).toBe(0); // Last paragraph is properly closed
    expect(slice.content.childCount).toBe(2); // Two sibling paragraphs

    // Verify first paragraph is empty
    const firstParagraph = slice.content.child(0);
    expect(firstParagraph.type.name).toBe('paragraph');
    expect(firstParagraph.childCount).toBe(0);

    // Verify second paragraph contains "a"
    const secondParagraph = slice.content.child(1);
    expect(secondParagraph.type.name).toBe('paragraph');
    expect(secondParagraph.textContent).toBe('a');

    // Critical: Verify that creating the slice doesn't throw "Invalid content"
    expect(() => {
      new Slice(slice.content, slice.openStart, slice.openEnd);
    }).not.toThrow();
  });

  test('multiple adjacent closing/opening pairs', () => {
    // Arrange
    const items = [
      new ClosingTagItem('paragraph'),
      new OpeningTagItem('paragraph', null),
      new ClosingTagItem('paragraph'),
      new OpeningTagItem('paragraph', null),
      new TextItem('b'),
      new ClosingTagItem('paragraph'),
    ];

    // Act
    const slice = itemsToSlice(items, schema);

    // Assert
    expect(slice.content.childCount).toBe(3); // Three sibling paragraphs
    expect(slice.openStart).toBe(1);
    expect(slice.openEnd).toBe(0);

    // Verify all paragraphs are siblings (not nested)
    const firstParagraph = slice.content.child(0);
    const secondParagraph = slice.content.child(1);
    const thirdParagraph = slice.content.child(2);

    expect(firstParagraph.type.name).toBe('paragraph');
    expect(secondParagraph.type.name).toBe('paragraph');
    expect(thirdParagraph.type.name).toBe('paragraph');

    expect(firstParagraph.childCount).toBe(0); // Empty
    expect(secondParagraph.childCount).toBe(0); // Empty
    expect(thirdParagraph.textContent).toBe('b'); // Contains "b"
  });

  test('mixed tag types - orphaned paragraph before list', () => {
    // Arrange
    const items = [
      new ClosingTagItem('paragraph'),
      new OpeningTagItem('bullet_list', null),
      new OpeningTagItem('list_item', null),
      new OpeningTagItem('paragraph', null),
      new TextItem('item'),
      new ClosingTagItem('paragraph'),
      new ClosingTagItem('list_item'),
      new ClosingTagItem('bullet_list'),
    ];

    // Act
    const slice = itemsToSlice(items, schema);

    // Assert
    expect(slice.content.childCount).toBe(2); // Paragraph and bullet_list as siblings
    expect(slice.openStart).toBe(1); // Orphaned paragraph

    const orphanedParagraph = slice.content.child(0);
    const bulletList = slice.content.child(1);

    expect(orphanedParagraph.type.name).toBe('paragraph');
    expect(orphanedParagraph.childCount).toBe(0); // Empty

    expect(bulletList.type.name).toBe('bullet_list');
    expect(bulletList.childCount).toBe(1); // Contains one list_item

    // Verify the orphaned paragraph is NOT nested inside the bullet_list
    expect(bulletList.firstChild?.type.name).toBe('list_item');
    expect(bulletList.firstChild?.firstChild?.type.name).toBe('paragraph');
    expect(bulletList.firstChild?.firstChild?.textContent).toBe('item');
  });
});

describe('integrate', function () {
  test('integrate into empty doc', function () {
    const doc = new Document();
    const pos = new Position(doc);
    const item = new TextItem('1');
    item.integrate(pos);
    expect(doc.head).toBe(item);
    expect(doc.clock).toBe(1);
  });

  test('integrate into tags', function () {
    const doc = Document.fromNodes(Fragment.from([schema.node('paragraph')]));
    const pos = new Position(doc);
    pos.forward();
    const item = new TextItem('1');
    item.integrate(pos);
    expect(doc.clock).toBe(3);
  });
});

// ============================================================================
// Item.isIntegrated() - Integration Status Check
// ============================================================================

describe('Item.isIntegrated()', () => {
  test('returns false for newly constructed items', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item = new TextItem('a');

    // Act
    const result = item.isIntegrated(doc);

    // Assert
    expect(result).toBe(false);
  });

  test('returns true after local integration', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item = new TextItem('a');
    const pos = new Position(doc);

    // Act
    item.integrate(pos);

    // Assert
    expect(item.isIntegrated(doc)).toBe(true);
  });

  test('returns false for items loaded from JSON before putIntoDocument', () => {
    // Arrange
    const doc = createEmptyDoc();
    const json = {
      type: 'text' as const,
      id: { client: 'client1', clock: 0 },
      text: 'a',
      marks: [],
      deleted: false,
    };

    // Act
    const item = TextItem.fromJSON(json);

    // Assert
    expect(item.id).not.toBeNull(); // Has ID
    expect(item.isIntegrated(doc)).toBe(false); // But not in linked list yet
  });

  test('returns true for remote items after putIntoDocument', () => {
    // Arrange
    const doc = createEmptyDoc();
    const json = {
      type: 'text' as const,
      id: { client: 'client1', clock: 0 },
      text: 'a',
      marks: [],
      deleted: false,
    };
    const item = TextItem.fromJSON(json);

    // Act
    item.putIntoDocument(doc);

    // Assert
    expect(item.isIntegrated(doc)).toBe(true);
  });

  test('returns true for head item in document', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item = new TextItem('x');

    // Act
    item.integrate(new Position(doc));

    // Assert
    expect(doc.head).toBe(item);
    expect(item.isIntegrated(doc)).toBe(true);
  });

  test('returns true for item with left neighbor', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item1 = new TextItem('a');
    const item2 = new TextItem('b');
    const pos = new Position(doc);

    // Act
    item1.integrate(pos);
    item2.integrate(pos);

    // Assert
    expect(item2.left).toBe(item1);
    expect(item2.isIntegrated()).toBe(true); // No doc param needed
  });

  test('returns true for item with right neighbor', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item1 = new TextItem('a');
    const item2 = new TextItem('b');
    const pos = new Position(doc);

    // Act
    item1.integrate(pos);
    item2.integrate(pos);

    // Assert
    expect(item1.right).toBe(item2);
    expect(item1.isIntegrated()).toBe(true); // No doc param needed
  });

  test('works for all item types', () => {
    // Arrange
    const doc = createEmptyDoc();
    const textItem = new TextItem('x');
    const openingTag = new OpeningTagItem('p', {});

    // Act
    textItem.integrate(new Position(doc));

    // Assert
    expect(textItem.isIntegrated(doc)).toBe(true);
    expect(openingTag.isIntegrated(doc)).toBe(false); // not integrated yet
  });

  test('returns false without doc param for sole head item', () => {
    // Arrange
    const doc = createEmptyDoc();
    const item = new TextItem('x');

    // Act
    item.integrate(new Position(doc));

    // Assert
    expect(doc.head).toBe(item);
    expect(item.left).toBeNull();
    expect(item.right).toBeNull();
    expect(item.isIntegrated()).toBe(false); // No neighbors
    expect(item.isIntegrated(doc)).toBe(true); // But is doc.head
  });

  test('distinguishes between item with ID and item in list', () => {
    // Arrange
    const doc = createEmptyDoc();

    // Create a remote item with ID but not in list
    const remoteItem = TextItem.fromJSON({
      type: 'text' as const,
      id: { client: 'remote', clock: 5 },
      text: 'x',
      marks: [],
      deleted: false,
    });

    // Create a local item and integrate it
    const localItem = new TextItem('y');
    localItem.integrate(new Position(doc));

    // Assert
    expect(remoteItem.id).not.toBeNull();
    expect(remoteItem.isIntegrated(doc)).toBe(false);

    expect(localItem.id).not.toBeNull();
    expect(localItem.isIntegrated(doc)).toBe(true);
  });
});

describe('OpeningTagItem.replaceWithClosingTagItem', function () {
  test('replaces opening tag with new opening tag and creates SetAttrItems', function () {
    // Arrange - Use ReplaceStep to create the scenario
    const doc = createEmptyDoc('client1');

    doc.replaceItems(0, 0, [
      new OpeningTagItem('paragraph', null),
      new TextItem('1'),
      new ClosingTagItem('paragraph'),
    ]);

    const initialItems = doc.toArray();
    const initialOpening = initialItems[0] as OpeningTagItem;
    const initialClosing = initialItems[2] as ClosingTagItem;

    expect(initialOpening.targetId).toEqual(initialClosing.id);
    const initialCount = initialItems.length;

    // Act - Replace content, which triggers replaceWithClosingTagItem
    doc.applyStep(
      new ReplaceStep(
        1,
        3,
        new Slice(
          Fragment.from([schema.node('paragraph', null, [schema.text('2')])]),
          1,
          0,
        ),
      ),
    );

    // Assert
    const allItems = doc.toArray();

    // Should have 9 items: 3 original + 2 new + 2 SetAttrItems for deletions + 2 SetAttrItems for pairing
    expect(allItems.length).toBe(9);

    // Old opening tag should be deleted
    expect(initialOpening.deleted).toBe(true);

    // Check that SetAttrItems were created for pairing
    const setAttrItems = allItems.filter(
      (item) =>
        item instanceof SetAttrItem &&
        (item as SetAttrItem).key === 'targetId',
    );
    expect(setAttrItems.length).toBe(2);

    // Verify replacement happened (new non-deleted opening tag exists)
    const nonDeletedOpenings = allItems.filter(
      (item) => item instanceof OpeningTagItem && !item.deleted,
    );
    expect(nonDeletedOpenings.length).toBe(1);
  });

  test('new opening tag has same tagName and attrs as old one', function () {
    // Arrange
    const doc = createEmptyDoc('client1');

    doc.replaceItems(0, 0, [
      new OpeningTagItem('heading', { level: 2, id: 'test' }),
      new TextItem('text'),
      new ClosingTagItem('heading'),
    ]);

    const initialOpening = doc.toArray()[0] as OpeningTagItem;

    // Act - Replace triggers replaceWithClosingTagItem
    doc.applyStep(
      new ReplaceStep(
        1,
        3,
        new Slice(
          Fragment.from([
            schema.node('heading', { level: 2, id: 'test' }, [schema.text('new')]),
          ]),
          1,
          0,
        ),
      ),
    );

    // Assert - New opening tag should have same attrs
    const allItems = doc.toArray();
    const openingTags = allItems.filter(
      (item) => item instanceof OpeningTagItem && !item.deleted,
    );

    expect(openingTags.length).toBe(1);
    const newOpeningTag = openingTags[0] as OpeningTagItem;

    expect(newOpeningTag.tagName).toBe('heading');
    expect(newOpeningTag.attrs).toEqual({ level: 2, id: 'test' });
  });

  test('SetAttrItems are created at end of document', function () {
    // Arrange
    const doc = createEmptyDoc('client1');

    doc.replaceItems(0, 0, [
      new OpeningTagItem('paragraph', null),
      new TextItem('1'),
      new ClosingTagItem('paragraph'),
    ]);

    // Act - Replace triggers replaceWithClosingTagItem
    doc.applyStep(
      new ReplaceStep(
        1,
        3,
        new Slice(
          Fragment.from([schema.node('paragraph', null, [schema.text('2')])]),
          1,
          0,
        ),
      ),
    );

    // Assert - Last 2 items should be targetId SetAttrItems
    const allItems = doc.toArray();
    const lastTwo = allItems.slice(-2);

    expect(lastTwo[0]).toBeInstanceOf(SetAttrItem);
    expect(lastTwo[1]).toBeInstanceOf(SetAttrItem);
    expect((lastTwo[0] as SetAttrItem).key).toBe('targetId');
    expect((lastTwo[1] as SetAttrItem).key).toBe('targetId');
  });
});

// Note: ClosingTagItem.replaceWithOpeningTagItem is tested indirectly through
// document integration tests. It follows the same pattern as replaceWithClosingTagItem.
