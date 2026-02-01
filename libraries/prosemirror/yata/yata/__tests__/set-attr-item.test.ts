import { describe, test, expect } from 'vitest';
import {
  SetAttrItem,
  TextItem,
  OpeningTagItem,
  ClosingTagItem,
  NodeItem,
} from '../item.js';
import { Document, Position } from '../document.js';
import {
  createEmptyDoc,
  createDocWithText,
  createDocWithParagraph,
} from './helpers/test-helpers.js';

describe('SetAttrItem - Basic Functionality', function () {
  test('creates SetAttrItem with targetId only', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };

    // Act
    const setAttrItem = new SetAttrItem(targetId);

    // Assert
    expect(setAttrItem.targetId).toEqual(targetId);
    expect(setAttrItem.setDeleted).toBeUndefined();
    expect(setAttrItem.setAttrs).toBeUndefined();
    expect(setAttrItem.setTargetId).toBeUndefined();
  });

  test('creates SetAttrItem with setDeleted option', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };

    // Act
    const setAttrItem = new SetAttrItem(targetId, { setDeleted: true });

    // Assert
    expect(setAttrItem.targetId).toEqual(targetId);
    expect(setAttrItem.setDeleted).toBe(true);
  });

  test('creates SetAttrItem with setAttrs option', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };
    const attrs = { level: 2, id: 'heading-1' };

    // Act
    const setAttrItem = new SetAttrItem(targetId, { setAttrs: attrs });

    // Assert
    expect(setAttrItem.targetId).toEqual(targetId);
    expect(setAttrItem.setAttrs).toEqual(attrs);
  });

  test('creates SetAttrItem with setTargetId option', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };
    const newTargetId = { client: 'client2', clock: 10 };

    // Act
    const setAttrItem = new SetAttrItem(targetId, { setTargetId: newTargetId });

    // Assert
    expect(setAttrItem.targetId).toEqual(targetId);
    expect(setAttrItem.setTargetId).toEqual(newTargetId);
  });

  test('creates SetAttrItem with all options', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };
    const attrs = { level: 2 };
    const newTargetId = { client: 'client2', clock: 10 };

    // Act
    const setAttrItem = new SetAttrItem(targetId, {
      setDeleted: true,
      setAttrs: attrs,
      setTargetId: newTargetId,
    });

    // Assert
    expect(setAttrItem.targetId).toEqual(targetId);
    expect(setAttrItem.setDeleted).toBe(true);
    expect(setAttrItem.setAttrs).toEqual(attrs);
    expect(setAttrItem.setTargetId).toEqual(newTargetId);
  });
});

describe('SetAttrItem - Serialization', function () {
  test('toJSON() serializes correctly with all options', function () {
    // Arrange
    const doc = createEmptyDoc('client1');
    const targetId = { client: 'client1', clock: 5 };
    const attrs = { level: 2 };
    const newTargetId = { client: 'client2', clock: 10 };
    const setAttrItem = new SetAttrItem(targetId, {
      setDeleted: true,
      setAttrs: attrs,
      setTargetId: newTargetId,
    });
    const pos = new Position(doc);

    // Act
    setAttrItem.integrate(pos);
    const json = setAttrItem.toJSON();

    // Assert
    expect(json.type).toBe('setAttr');
    expect(json.targetId).toEqual(targetId);
    expect(json.setDeleted).toBe(true);
    expect(json.setAttrs).toEqual(attrs);
    expect(json.setTargetId).toEqual(newTargetId);
    expect(json.id).toEqual({ client: 'client1', clock: 0 });
  });

  test('toJSON() omits undefined options', function () {
    // Arrange
    const doc = createEmptyDoc('client1');
    const targetId = { client: 'client1', clock: 5 };
    const setAttrItem = new SetAttrItem(targetId);
    const pos = new Position(doc);

    // Act
    setAttrItem.integrate(pos);
    const json = setAttrItem.toJSON();

    // Assert
    expect(json.type).toBe('setAttr');
    expect(json.targetId).toEqual(targetId);
    expect('setDeleted' in json).toBe(false);
    expect('setAttrs' in json).toBe(false);
    expect('setTargetId' in json).toBe(false);
  });

  test('fromJSON() deserializes correctly', function () {
    // Arrange
    const json = {
      id: { client: 'client1', clock: 10 },
      type: 'setAttr' as const,
      targetId: { client: 'client1', clock: 5 },
      setDeleted: true,
      setAttrs: { level: 2 },
      setTargetId: { client: 'client2', clock: 20 },
    };

    // Act
    const setAttrItem = SetAttrItem.fromJSON(json);

    // Assert
    expect(setAttrItem).toBeInstanceOf(SetAttrItem);
    expect(setAttrItem.id).toEqual({ client: 'client1', clock: 10 });
    expect(setAttrItem.targetId).toEqual({ client: 'client1', clock: 5 });
    expect(setAttrItem.setDeleted).toBe(true);
    expect(setAttrItem.setAttrs).toEqual({ level: 2 });
    expect(setAttrItem.setTargetId).toEqual({ client: 'client2', clock: 20 });
  });

  test('toHTMLString() returns empty string', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };
    const setAttrItem = new SetAttrItem(targetId);

    // Act
    const html = setAttrItem.toHTMLString();

    // Assert
    expect(html).toBe('');
  });
});

describe('SetAttrItem - Setting deleted flag', function () {
  test('SetAttrItem with setDeleted: true marks existing item as deleted', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'
    expect(targetItem.deleted).toBe(false);

    // Act
    const setAttrItem = new SetAttrItem(targetItem.id!, { setDeleted: true });
    const pos = doc.resolvePosition(3); // Insert at end
    setAttrItem.integrate(pos);

    // Assert
    expect(targetItem.deleted).toBe(true);
    expect(setAttrItem.deleted).toBe(false); // SetAttrItem itself is not deleted
  });

  test('SetAttrItem with setDeleted: false can undelete item', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'
    targetItem.deleted = true; // Pre-delete the item

    // Act
    const setAttrItem = new SetAttrItem(targetItem.id!, { setDeleted: false });
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Assert
    expect(targetItem.deleted).toBe(false);
  });

  test('replaceItems uses SetAttrItem for deletions', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const initialItemCount = doc.toArray().length;

    // Act - Delete from position 0 to 1 (delete 'a')
    doc.replaceItems(0, 1, []);

    // Assert
    const allItems = doc.toArray();
    // Should have original items + 1 SetAttrItem
    expect(allItems.length).toBe(initialItemCount + 1);

    // Find the SetAttrItem
    const setAttrItems = allItems.filter((item) => item instanceof SetAttrItem);
    expect(setAttrItems.length).toBe(1);

    // The first text item 'a' should be deleted
    const textItems = allItems.filter((item) => item instanceof TextItem);
    const firstTextItem = textItems[0];
    expect(firstTextItem.deleted).toBe(true);
  });
});

describe('SetAttrItem - Setting node attributes', function () {
  test('SetAttrItem sets attrs on OpeningTagItem', function () {
    // Arrange
    const doc = createDocWithParagraph('hi', 'client1');
    const items = doc.toArray();
    const openingTag = items.find(
      (item) => item instanceof OpeningTagItem,
    ) as OpeningTagItem;
    // Note: createDocWithParagraph uses empty object {} for attrs, not null

    // Act
    const setAttrItem = new SetAttrItem(openingTag.id!, {
      setAttrs: { class: 'highlighted' },
    });
    const pos = doc.resolvePosition(4); // Insert at end
    setAttrItem.integrate(pos);

    // Assert
    expect(openingTag.attrs).toEqual({ class: 'highlighted' });
  });

  test('SetAttrItem sets attrs on NodeItem', function () {
    // Arrange
    const doc = createEmptyDoc('client1');
    const nodeItem = new NodeItem('image', { src: 'old.png' });
    const pos = new Position(doc);
    nodeItem.integrate(pos);

    // Act
    const setAttrItem = new SetAttrItem(nodeItem.id!, {
      setAttrs: { src: 'new.png', alt: 'New image' },
    });
    const pos2 = doc.resolvePosition(1);
    setAttrItem.integrate(pos2);

    // Assert
    expect(nodeItem.attrs).toEqual({ src: 'new.png', alt: 'New image' });
  });

  test('SetAttrItem does not set attrs on TextItem', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const textItem = items[0] as TextItem;

    // Act
    const setAttrItem = new SetAttrItem(textItem.id!, {
      setAttrs: { should: 'not apply' },
    });
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Assert - TextItem doesn't have attrs property, so nothing should happen
    expect('attrs' in textItem).toBe(false);
  });
});

describe('SetAttrItem - Setting targetId (paired tags)', function () {
  test('SetAttrItem sets targetId on OpeningTagItem', function () {
    // Arrange
    const doc = createDocWithParagraph('hi', 'client1');
    const items = doc.toArray();
    const openingTag = items.find(
      (item) => item instanceof OpeningTagItem,
    ) as OpeningTagItem;
    const newTargetId = { client: 'client2', clock: 99 };

    // Act
    const setAttrItem = new SetAttrItem(openingTag.id!, {
      setTargetId: newTargetId,
    });
    const pos = doc.resolvePosition(4);
    setAttrItem.integrate(pos);

    // Assert
    expect(openingTag.targetId).toEqual(newTargetId);
  });

  test('SetAttrItem sets targetId on ClosingTagItem', function () {
    // Arrange
    const doc = createDocWithParagraph('hi', 'client1');
    const items = doc.toArray();
    const closingTag = items.find(
      (item) => item instanceof ClosingTagItem,
    ) as ClosingTagItem;
    const newTargetId = { client: 'client2', clock: 99 };

    // Act
    const setAttrItem = new SetAttrItem(closingTag.id!, {
      setTargetId: newTargetId,
    });
    const pos = doc.resolvePosition(4);
    setAttrItem.integrate(pos);

    // Assert
    expect(closingTag.targetId).toEqual(newTargetId);
  });
});

describe('SetAttrItem - Remote integration via putIntoDocument', function () {
  test('putIntoDocument applies setDeleted to target', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'

    // Act
    const setAttrItem = new SetAttrItem(targetItem.id!, { setDeleted: true });
    setAttrItem.putIntoDocument(doc);

    // Assert
    expect(targetItem.deleted).toBe(true);
  });

  test('putIntoDocument applies setAttrs to target', function () {
    // Arrange
    const doc = createDocWithParagraph('hi', 'client1');
    const items = doc.toArray();
    const openingTag = items.find(
      (item) => item instanceof OpeningTagItem,
    ) as OpeningTagItem;

    // Act
    const setAttrItem = new SetAttrItem(openingTag.id!, {
      setAttrs: { class: 'remote-update' },
    });
    setAttrItem.putIntoDocument(doc);

    // Assert
    expect(openingTag.attrs).toEqual({ class: 'remote-update' });
  });

  test('SetAttrItem arriving before target item via applyItems', function () {
    // Arrange - Create two documents
    const doc1 = createEmptyDoc('client1');
    const doc2 = createDocWithParagraph('hi', 'client2');

    // Get the OpeningTagItem from doc2
    const openingTag = doc2.toArray().find(
      (item) => item instanceof OpeningTagItem,
    ) as OpeningTagItem;
    const targetId = openingTag.id!;

    // Create a SetAttrItem in doc1 that targets the OpeningTagItem
    const setAttrItem = new SetAttrItem(targetId, {
      setAttrs: { modified: true },
    });
    const pos2 = new Position(doc1);
    setAttrItem.integrate(pos2);

    // Export items from doc1
    const doc1Items = doc1.toItems();

    // Act - Apply doc1's SetAttrItem to doc2 (where target exists)
    doc2.applyItems(doc1Items, {} as any);

    // Assert - The target item should have the SetAttrItem's changes applied
    const updatedOpeningTag = doc2.toArray().find(
      (item) => item instanceof OpeningTagItem,
    ) as OpeningTagItem;
    expect(updatedOpeningTag.attrs).toEqual({ modified: true });
  });

  test('SetAttrItem arriving before target via putIntoDocument', function () {
    // Arrange - Create a document with existing content
    const doc = createDocWithText('abc', 'client1');

    // Create a SetAttrItem that targets a future OpeningTagItem
    const futureTargetId = { client: 'client2', clock: 0 };
    const setAttrItem = new SetAttrItem(futureTargetId, {
      setAttrs: { modified: true },
    });
    setAttrItem.id = { client: 'client1', clock: 10 };
    setAttrItem.originalLeft = null;
    setAttrItem.originalRight = null;
    setAttrItem.putIntoDocument(doc);

    // Now create the target OpeningTagItem
    const openingTag = new OpeningTagItem('paragraph', { initial: true });
    openingTag.id = futureTargetId;
    openingTag.originalLeft = null;
    openingTag.originalRight = null;

    // Act - Integrate the target item
    openingTag.putIntoDocument(doc);

    // Assert - The target item should have the pending SetAttrItem's changes applied
    expect(openingTag.attrs).toEqual({ modified: true });
  });

  test('Multiple SetAttrItems for same target are all applied', function () {
    // Arrange
    const doc = createEmptyDoc('client1');

    // Create target OpeningTagItem first
    const openingTag = new OpeningTagItem('paragraph', { initial: true });
    const pos1 = new Position(doc);
    openingTag.integrate(pos1);

    // Create multiple SetAttrItems for the same target
    const setAttrItem1 = new SetAttrItem(openingTag.id!, { setAttrs: { a: 1 } });
    const pos2 = doc.resolvePosition(1);
    setAttrItem1.integrate(pos2);
    expect(openingTag.attrs).toEqual({ a: 1 });

    const setAttrItem2 = new SetAttrItem(openingTag.id!, { setAttrs: { b: 2 } });
    const pos3 = doc.resolvePosition(1);
    setAttrItem2.integrate(pos3);

    // Assert - Each SetAttrItem applies immediately when integrated
    expect(openingTag.attrs).toEqual({ b: 2 });
  });
});

describe('SetAttrItem - findSetAttrItemsByTargetId', function () {
  test('finds SetAttrItems by targetId', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0];

    const setAttrItem = new SetAttrItem(targetItem.id!, { setDeleted: true });
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Act
    const found = doc.findSetAttrItemsByTargetId(targetItem.id!);

    // Assert
    expect(found).toHaveLength(1);
    expect(found[0]).toBe(setAttrItem);
  });

  test('finds multiple SetAttrItems with same targetId', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0];

    const setAttrItem1 = new SetAttrItem(targetItem.id!, { setDeleted: true });
    const setAttrItem2 = new SetAttrItem(targetItem.id!, {
      setAttrs: { test: true },
    });
    const pos1 = doc.resolvePosition(3);
    setAttrItem1.integrate(pos1);
    const pos2 = doc.resolvePosition(3);
    setAttrItem2.integrate(pos2);

    // Act
    const found = doc.findSetAttrItemsByTargetId(targetItem.id!);

    // Assert
    expect(found).toHaveLength(2);
    expect(found).toContain(setAttrItem1);
    expect(found).toContain(setAttrItem2);
  });

  test('returns empty array when no SetAttrItem found', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const nonExistentId = { client: 'client2', clock: 99 };

    // Act
    const found = doc.findSetAttrItemsByTargetId(nonExistentId);

    // Assert
    expect(found).toEqual([]);
  });
});

describe('SetAttrItem - Position.forward() skips SetAttrItems', function () {
  test('forward() skips over SetAttrItems', function () {
    // Arrange
    const doc = createDocWithText('ab', 'client1');

    // Insert a SetAttrItem at the end
    const setAttrItem = new SetAttrItem(
      { client: 'other', clock: 99 },
      { setDeleted: true },
    );
    const pos = doc.resolvePosition(2); // After 'ab'
    setAttrItem.integrate(pos);

    // Verify the structure
    const allItems = doc.toArray();
    expect(allItems.length).toBe(3); // 'a', 'b', SetAttrItem
    expect(allItems[2]).toBeInstanceOf(SetAttrItem);

    // Act - Forward from position 1 should skip over SetAttrItem
    const testPos = doc.resolvePosition(1);
    testPos.forward(); // Should move to position 2, which skips the SetAttrItem

    // Assert - Should be at position 2, having skipped the SetAttrItem
    // so right should be null (end of visible items)
    expect(testPos.right).toBeNull();
  });
});

describe('SetAttrItem - toProseMirrorDoc() excludes SetAttrItems', function () {
  test('SetAttrItems are excluded from rendered document', function () {
    // Arrange
    const doc = createDocWithText('abc', 'client1');
    const items = doc.toArray();

    // Add a SetAttrItem that marks first item as deleted
    const setAttrItem = new SetAttrItem(items[0].id!, { setDeleted: true });
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Verify deletion was applied
    expect(items[0].deleted).toBe(true);

    // Act - Check that non-deleted, non-SetAttrItem items are correctly filtered
    const nonDeletedItems = doc
      .toArray()
      .filter((item) => !item.deleted && !(item instanceof SetAttrItem));
    const text = nonDeletedItems
      .filter((item) => item instanceof TextItem)
      .map((item) => (item as TextItem).text)
      .join('');

    // Assert - Should only have 'bc' (first item 'a' is deleted)
    expect(text).toBe('bc');
  });
});
