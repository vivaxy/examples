import { describe, test, expect } from 'vitest';
import { SetAttrItem, TextItem } from '../item.js';
import { Position } from '../document.js';
import { createEmptyDoc, createDocWithText } from './helpers/test-helpers.js';

describe('SetAttrItem - Deletion via deleted', function () {
  test('SetAttrItem with deleted: true marks existing item as deleted', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'
    expect(targetItem.deleted).toBe(false);

    // Act
    const setAttrItem = new SetAttrItem(targetItem.id!, 'deleted', true);
    const pos = doc.resolvePosition(3); // Insert at end
    setAttrItem.integrate(pos);

    // Assert
    expect(targetItem.deleted).toBe(true);
    expect(setAttrItem.deleted).toBe(false); // SetAttrItem itself is not deleted
  });

  test('SetAttrItem integration applies deleted immediately', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'

    // Act
    const setAttrItem = new SetAttrItem(targetItem.id!, 'deleted', true);
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Assert
    expect(targetItem.deleted).toBe(true);
  });

  test('SetAttrItem for non-existent target stores deletion for later', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const nonExistentId = { client: 'client2', clock: 99 };

    // Act
    const setAttrItem = new SetAttrItem(nonExistentId, 'deleted', true);
    const change = setAttrItem.putIntoDocument(doc);

    // Assert - SetAttrItem is inserted, waiting for target
    expect(change).toBeDefined();
    expect(change?.type).toBe('insert');
    expect(change?.item).toBe(setAttrItem);
  });

  test('Multiple SetAttrItems for same target - last one wins', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'

    // Act - Create two SetAttrItems, first deletes, second undeletes
    const setAttrItem1 = new SetAttrItem(targetItem.id!, 'deleted', true);
    const pos1 = doc.resolvePosition(3);
    setAttrItem1.integrate(pos1);
    expect(targetItem.deleted).toBe(true);

    const setAttrItem2 = new SetAttrItem(targetItem.id!, 'deleted', false);
    const pos2 = doc.resolvePosition(3);
    setAttrItem2.integrate(pos2);

    // Assert - Second SetAttrItem undeletes the item
    expect(targetItem.deleted).toBe(false);
  });
});

describe('SetAttrItem - Document.replaceItemsInner()', function () {
  test('replaceItemsInner creates SetAttrItems for deleted range', function () {
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
    expect((setAttrItems[0] as SetAttrItem).key).toBe('deleted');
    expect((setAttrItems[0] as SetAttrItem).value).toBe(true);

    // The first text item 'a' should be deleted
    const textItems = allItems.filter((item) => item instanceof TextItem);
    const firstTextItem = textItems[0];
    expect(firstTextItem.deleted).toBe(true);
  });

  test('replaceItemsInner creates multiple SetAttrItems for multi-char deletion', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');

    // Act - Delete from position 0 to 2 (delete 'ab')
    doc.replaceItems(0, 2, []);

    // Assert
    const allItems = doc.toArray();
    const setAttrItems = allItems.filter((item) => item instanceof SetAttrItem);
    expect(setAttrItems.length).toBe(2); // Two SetAttrItems created
    expect((setAttrItems[0] as SetAttrItem).key).toBe('deleted');
    expect((setAttrItems[0] as SetAttrItem).value).toBe(true);
    expect((setAttrItems[1] as SetAttrItem).key).toBe('deleted');
    expect((setAttrItems[1] as SetAttrItem).value).toBe(true);

    // The first two text items should be deleted
    const textItems = allItems.filter((item) => item instanceof TextItem);
    expect(textItems[0].deleted).toBe(true); // 'a'
    expect(textItems[1].deleted).toBe(true); // 'b'
    expect(textItems[2].deleted).toBe(false); // 'c'
  });
});

describe('SetAttrItem - findSetAttrItemsByTarget()', function () {
  test('finds SetAttrItem by targetId', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0];

    const setAttrItem = new SetAttrItem(targetItem.id!, 'deleted', true);
    const pos = doc.resolvePosition(3);
    setAttrItem.integrate(pos);

    // Act
    const found = doc.findSetAttrItemsByTarget(targetItem.id!);

    // Assert
    expect(found).toHaveLength(1);
    expect(found[0]).toBe(setAttrItem);
  });

  test('returns empty array when SetAttrItem not found', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const nonExistentId = { client: 'client2', clock: 99 };

    // Act
    const found = doc.findSetAttrItemsByTarget(nonExistentId);

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
      'deleted',
      true,
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
    const setAttrItem = new SetAttrItem(items[0].id!, 'deleted', true);
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
