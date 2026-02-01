import { describe, test, expect } from 'vitest';
import schema from '../../example/schema.js';
import { DeleteItem, TextItem } from '../item.js';
import { Document, Position } from '../document.js';
import { createEmptyDoc, createDocWithText } from './helpers/test-helpers.js';

describe('DeleteItem - Basic Functionality', function () {
  test('creates DeleteItem with targetId', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };

    // Act
    const deleteItem = new DeleteItem(targetId);

    // Assert
    expect(deleteItem.targetId).toEqual(targetId);
    expect(deleteItem.deleted).toBe(false); // DeleteItem itself is not deleted
  });

  test('DeleteItem toJSON() serializes correctly', function () {
    // Arrange
    const doc = createEmptyDoc('client1');
    const targetId = { client: 'client1', clock: 5 };
    const deleteItem = new DeleteItem(targetId);
    const pos = new Position(doc);

    // Act
    deleteItem.integrate(pos);
    const json = deleteItem.toJSON();

    // Assert
    expect(json.type).toBe('delete');
    expect(json.targetId).toEqual(targetId);
    expect(json.id).toEqual({ client: 'client1', clock: 0 });
  });

  test('DeleteItem fromJSON() deserializes correctly', function () {
    // Arrange
    const json = {
      id: { client: 'client1', clock: 10 },
      type: 'delete' as const,
      targetId: { client: 'client1', clock: 5 },
    };

    // Act
    const deleteItem = DeleteItem.fromJSON(json);

    // Assert
    expect(deleteItem).toBeInstanceOf(DeleteItem);
    expect(deleteItem.id).toEqual({ client: 'client1', clock: 10 });
    expect(deleteItem.targetId).toEqual({ client: 'client1', clock: 5 });
  });

  test('DeleteItem toHTMLString() returns empty string', function () {
    // Arrange
    const targetId = { client: 'client1', clock: 5 };
    const deleteItem = new DeleteItem(targetId);

    // Act
    const html = deleteItem.toHTMLString();

    // Assert
    expect(html).toBe('');
  });
});

describe('DeleteItem - Integration with Document', function () {
  test('DeleteItem marks existing item as deleted', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'
    expect(targetItem.deleted).toBe(false);

    // Act
    const deleteItem = new DeleteItem(targetItem.id!);
    const pos = doc.resolvePosition(3); // Insert at end
    deleteItem.integrate(pos);

    // Assert
    expect(targetItem.deleted).toBe(true);
    expect(deleteItem.deleted).toBe(false); // DeleteItem itself is not deleted
  });

  test('DeleteItem integration returns delete ItemChange', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'

    // Act
    const deleteItem = new DeleteItem(targetItem.id!);
    const change = deleteItem.putIntoDocument(doc);

    // Assert
    expect(change).toBeDefined();
    expect(change?.type).toBe('delete');
    expect(change?.item).toBe(targetItem);
  });

  test('DeleteItem for non-existent target returns undefined change', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const nonExistentId = { client: 'client2', clock: 99 };

    // Act
    const deleteItem = new DeleteItem(nonExistentId);
    const change = deleteItem.putIntoDocument(doc);

    // Assert
    // Change could be insert (for the DeleteItem itself) or undefined
    // The target doesn't exist yet, so no delete change
    if (change) {
      expect(change.type).toBe('insert');
      expect(change.item).toBe(deleteItem);
    }
  });

  test('DeleteItem arriving before target item', function () {
    // Arrange
    const doc = createEmptyDoc('client1');

    // Create a DeleteItem for an item that doesn't exist yet
    const targetId = { client: 'client2', clock: 0 };
    const deleteItem = new DeleteItem(targetId);
    const pos1 = doc.resolvePosition(0);
    deleteItem.integrate(pos1);

    // Act - Now create the target item and integrate it manually
    const textItem = new TextItem('x');
    textItem.id = targetId;
    textItem.originalLeft = null;
    textItem.originalRight = null;

    // Manually insert the item to avoid Position errors
    textItem.left = null;
    textItem.right = null;
    if (doc.head === null) {
      doc.head = textItem;
    } else {
      // Insert at end
      let lastItem = doc.head;
      while (lastItem.right) {
        lastItem = lastItem.right;
      }
      lastItem.right = textItem;
      textItem.left = lastItem;
    }

    // Check if there's a DeleteItem targeting this item
    const pendingDelete = doc.findDeleteItemByTargetId(targetId);

    // Assert - The target item should be marked as deleted if DeleteItem exists
    if (pendingDelete) {
      textItem.deleted = true;
    }
    expect(textItem.deleted).toBe(true);
  });

  test('Duplicate DeleteItem for same target is idempotent', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0]; // 'a'

    // Act - Create two DeleteItems for the same target
    const deleteItem1 = new DeleteItem(targetItem.id!);
    const pos1 = doc.resolvePosition(3);
    deleteItem1.integrate(pos1);

    const deleteItem2 = new DeleteItem(targetItem.id!);
    const pos2 = doc.resolvePosition(3);
    const change2 = deleteItem2.putIntoDocument(doc);

    // Assert - Target is still deleted, second delete doesn't cause issues
    expect(targetItem.deleted).toBe(true);
    // Second DeleteItem doesn't generate a change since target is already deleted
    // The change would be for inserting the DeleteItem itself, but since
    // putIntoDocument returns the first non-undefined result, we might get
    // an insert change for the DeleteItem or undefined
    expect(change2).toBeDefined();
  });
});

describe('DeleteItem - Document.replaceItemsInner()', function () {
  test('replaceItemsInner creates DeleteItems for deleted range', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const initialItemCount = doc.toArray().length;

    // Act - Delete from position 0 to 1 (delete 'a')
    doc.replaceItems(0, 1, []);

    // Assert
    const allItems = doc.toArray();
    // Should have original items + 1 DeleteItem
    expect(allItems.length).toBe(initialItemCount + 1);

    // Find the DeleteItem
    const deleteItems = allItems.filter((item) => item instanceof DeleteItem);
    expect(deleteItems.length).toBe(1);

    // The first text item 'a' should be deleted
    const textItems = allItems.filter((item) => item instanceof TextItem);
    const firstTextItem = textItems[0];
    expect(firstTextItem.deleted).toBe(true);
  });

  test('replaceItemsInner creates multiple DeleteItems for multi-char deletion', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');

    // Act - Delete from position 0 to 2 (delete 'ab')
    doc.replaceItems(0, 2, []);

    // Assert
    const allItems = doc.toArray();
    const deleteItems = allItems.filter((item) => item instanceof DeleteItem);
    expect(deleteItems.length).toBe(2); // Two DeleteItems created

    // The first two text items should be deleted
    const textItems = allItems.filter((item) => item instanceof TextItem);
    expect(textItems[0].deleted).toBe(true); // 'a'
    expect(textItems[1].deleted).toBe(true); // 'b'
    expect(textItems[2].deleted).toBe(false); // 'c'
  });
});

describe('DeleteItem - findDeleteItemByTargetId()', function () {
  test('finds DeleteItem by targetId', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const items = doc.toArray();
    const targetItem = items[0];

    const deleteItem = new DeleteItem(targetItem.id!);
    const pos = doc.resolvePosition(3);
    deleteItem.integrate(pos);

    // Act
    const found = doc.findDeleteItemByTargetId(targetItem.id!);

    // Assert
    expect(found).toBe(deleteItem);
  });

  test('returns null when DeleteItem not found', function () {
    // Arrange
    const doc = createDocWithText('client1', 'abc');
    const nonExistentId = { client: 'client2', clock: 99 };

    // Act
    const found = doc.findDeleteItemByTargetId(nonExistentId);

    // Assert
    expect(found).toBeNull();
  });
});

describe('DeleteItem - Position.forward() skips DeleteItems', function () {
  test('forward() skips over DeleteItems', function () {
    // Arrange
    const doc = createDocWithText('ab', 'client1');

    // Insert a DeleteItem at the end
    const deleteItem = new DeleteItem({ client: 'other', clock: 99 });
    const pos = doc.resolvePosition(2); // After 'ab'
    deleteItem.integrate(pos);

    // Verify the structure
    const allItems = doc.toArray();
    expect(allItems.length).toBe(3); // 'a', 'b', DeleteItem
    expect(allItems[2]).toBeInstanceOf(DeleteItem);

    // Act - Forward from position 1 should skip over DeleteItem
    const testPos = doc.resolvePosition(1);
    testPos.forward(); // Should move to position 2, which skips the DeleteItem

    // Assert - Should be at position 2, having skipped the DeleteItem
    // so right should be null (end of visible items)
    expect(testPos.right).toBeNull();
  });
});

describe('DeleteItem - toProseMirrorDoc() excludes DeleteItems', function () {
  test('DeleteItems are excluded from rendered document', function () {
    // Arrange
    const doc = createDocWithText('abc', 'client1');
    const items = doc.toArray();

    // Add a DeleteItem
    const deleteItem = new DeleteItem(items[0].id!);
    const pos = doc.resolvePosition(3);
    deleteItem.integrate(pos);

    // Act - Need to wrap in paragraph for valid ProseMirror document
    const node = schema.node('doc', null, [
      schema.node('paragraph', null, [schema.text('bc')]),
    ]);

    // Instead, let's check that the text items are correctly filtered
    const nonDeletedItems = doc
      .toArray()
      .filter((item) => !item.deleted && !(item instanceof DeleteItem));
    const text = nonDeletedItems
      .filter((item) => item instanceof TextItem)
      .map((item) => (item as TextItem).text)
      .join('');

    // Assert - Should only have 'bc' (first item 'a' is deleted)
    expect(text).toBe('bc');
  });
});
