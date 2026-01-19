/**
 * Integration tests for YATA Document Synchronization
 * Tests CRDT convergence properties across concurrent editing scenarios
 */

import { Fragment } from 'prosemirror-model';
import schema from '../../schema';
import { Document, Position } from '../document';
import { TextItem, OpeningTagItem, ClosingTagItem } from '../item';
import {
  createMultiClientScenario,
  synchronizeDocs,
  syncBidirectional,
  assertConvergence,
  expectDocHTML,
  expectDocSize,
  expectItemId,
  expectItemsLinked,
  createDocWithText,
  createTextItems,
  createParagraphItems,
  logDocState,
  visualizeItemChain,
} from '../__tests__/helpers/test-helpers';

describe('YATA Document Synchronization Integration', () => {
  describe('Basic Two-Client Sync', () => {
    test('A1: single character insertion between two documents', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A inserts character 'x'
      const posA = new Position(docA);
      const itemX = new TextItem('x');
      itemX.integrate(posA);

      // Sync A -> B
      const itemsA = docA.toItems();
      docB.applyItems(itemsA);

      // Assert
      assertConvergence(
        [docA, docB],
        'Both documents should have same content',
      );
      expectDocHTML(docA, 'x');
      expectDocHTML(docB, 'x');
      expectDocSize(docA, 1);
      expectDocSize(docB, 1);
    });

    test('A2: multiple sequential insertions with incremental syncs', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A inserts 'a'
      let posA = new Position(docA);
      new TextItem('a').integrate(posA);
      syncBidirectional(docA, docB);

      // Client B inserts 'b'
      let posB = new Position(docB);
      posB.forward(); // Move after 'a'
      new TextItem('b').integrate(posB);
      syncBidirectional(docA, docB);

      // Client A inserts 'c'
      posA = new Position(docA);
      posA.forward(); // Move after 'a'
      posA.forward(); // Move after 'b'
      new TextItem('c').integrate(posA);
      syncBidirectional(docA, docB);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'abc');
      expectDocHTML(docB, 'abc');
      expectDocSize(docA, 3);
    });

    test('A3: empty to non-empty document sync', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A creates content
      const posA = new Position(docA);
      const textItems = createTextItems('hello');
      textItems.forEach((item) => item.integrate(posA));

      // Client B is still empty
      expectDocHTML(docB, '');

      // Sync A -> B
      syncBidirectional(docA, docB);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'hello');
      expectDocHTML(docB, 'hello');
      expectDocSize(docB, 5);
    });
  });

  describe('Concurrent Editing', () => {
    test('B1: concurrent insertions at same position with deterministic ordering', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Both clients insert at position 0 concurrently (before sync)
      const posA = new Position(docA);
      new TextItem('x').integrate(posA);

      const posB = new Position(docB);
      new TextItem('y').integrate(posB);

      // Sync documents
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      // Client IDs provide deterministic ordering: client-0 < client-1
      // So 'x' from client-0 should come before 'y' from client-1
      expectDocHTML(docA, 'xy');
      expectDocHTML(docB, 'xy');
    });

    test('B2: interleaved concurrent operations', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A inserts 'a' at position 0
      let posA = new Position(docA);
      new TextItem('a').integrate(posA);

      // Client B inserts 'b' at position 0 (concurrent with 'a')
      let posB = new Position(docB);
      new TextItem('b').integrate(posB);

      // Sync first round
      synchronizeDocs(docs);

      // Verify convergence after first sync
      assertConvergence(docs);

      // Client A inserts 'c' at end
      posA = new Position(docA);
      posA.forward();
      posA.forward();
      new TextItem('c').integrate(posA);

      // Sync second round
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'abc');
      expectDocSize(docA, 3);
    });

    test('B3: three-way concurrent insertions verify all sync permutations converge', () => {
      // Arrange
      const docs = createMultiClientScenario(3);
      const [docA, docB, docC] = docs;

      // Act
      // All three clients insert at position 0 concurrently
      const posA = new Position(docA);
      new TextItem('x').integrate(posA);

      const posB = new Position(docB);
      new TextItem('y').integrate(posB);

      const posC = new Position(docC);
      new TextItem('z').integrate(posC);

      // Sync all documents
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      // Ordering based on client IDs: client-0 < client-1 < client-2
      expectDocHTML(docA, 'xyz');
      expectDocHTML(docB, 'xyz');
      expectDocHTML(docC, 'xyz');
      expectDocSize(docA, 3);
    });

    test('B4: verify convergence regardless of sync order', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A inserts 'a'
      const posA = new Position(docA);
      new TextItem('a').integrate(posA);

      // Client B inserts 'b' concurrently
      const posB = new Position(docB);
      new TextItem('b').integrate(posB);

      // Test sync order: B -> A, then A -> B
      const itemsB = docB.toItems();
      docA.applyItems(itemsB);

      const itemsA = docA.toItems();
      docB.applyItems(itemsA);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'ab');
    });
  });

  describe('Deletion Semantics', () => {
    test('C1: simple deletion propagation', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Create "abc" on both docs via sync
      const posA = new Position(docA);
      createTextItems('abc').forEach((item) => item.integrate(posA));
      syncBidirectional(docA, docB);

      // Act
      // Client A deletes 'b' (middle character)
      const deletePos = docA.resolvePosition(1); // Position after 'a', before 'b'
      deletePos.right.delete(); // Delete 'b'

      // Sync deletion to B
      syncBidirectional(docA, docB);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'ac');
      expectDocHTML(docB, 'ac');

      // Verify tombstones: should still have 3 items total, one deleted
      const allItemsA = docA.toArray();
      expect(allItemsA.length).toBe(3);
      const deletedItems = allItemsA.filter((item) => item.deleted);
      expect(deletedItems.length).toBe(1);
      expect(deletedItems[0].text).toBe('b');
    });

    test('C2: concurrent insertion and deletion', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Create "ab" on both docs
      const posA = new Position(docA);
      createTextItems('ab').forEach((item) => item.integrate(posA));
      syncBidirectional(docA, docB);

      // Act
      // Client A inserts 'c' at end
      const insertPosA = new Position(docA);
      insertPosA.forward(); // after 'a'
      insertPosA.forward(); // after 'b'
      new TextItem('c').integrate(insertPosA);

      // Client B deletes 'a' (concurrent with A's insertion)
      const deletePosB = docB.resolvePosition(0); // Before 'a'
      deletePosB.right.delete(); // Delete 'a'

      // Sync both operations
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'bc');
      expectDocHTML(docB, 'bc');
    });

    test('C3: tombstone verification - deleted items remain in linked list', () => {
      // Arrange
      const doc = new Document('client-0');

      // Create "xyz"
      const pos = new Position(doc);
      const items = createTextItems('xyz');
      items.forEach((item) => item.integrate(pos));

      // Act
      // Delete 'y' (middle item)
      const deletePos = doc.resolvePosition(1);
      const itemY = deletePos.right;
      itemY.delete();

      // Assert
      // HTML should exclude deleted item
      expectDocHTML(doc, 'xz');

      // But linked list should still include it
      const allItems = doc.toArray();
      expect(allItems.length).toBe(3);

      // Verify the deleted item
      const deletedItem = allItems.find((item) => item.deleted);
      expect(deletedItem).toBeDefined();
      expect(deletedItem.text).toBe('y');
      expect(deletedItem.deleted).toBe(true);

      // Verify linked list integrity
      const itemX = allItems[0];
      const itemZ = allItems[2];
      expectItemsLinked(itemX, itemY);
      expectItemsLinked(itemY, itemZ);
    });

    test('C4: multiple concurrent deletions converge', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Create "abcd" on both docs
      const pos = new Position(docA);
      createTextItems('abcd').forEach((item) => item.integrate(pos));
      syncBidirectional(docA, docB);

      // Act
      // Client A deletes 'b'
      const deletePosA = docA.resolvePosition(1);
      deletePosA.right.delete();

      // Client B deletes 'd' (concurrent)
      const deletePosB = docB.resolvePosition(3);
      deletePosB.right.delete();

      // Sync deletions
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'ac');
      expectDocHTML(docB, 'ac');

      // Verify two tombstones
      const deletedItemsA = docA.toArray().filter((item) => item.deleted);
      expect(deletedItemsA.length).toBe(2);
    });

    test('C5: delete same item concurrently (idempotent deletion)', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Create "abc" on both docs
      const pos = new Position(docA);
      createTextItems('abc').forEach((item) => item.integrate(pos));
      syncBidirectional(docA, docB);

      // Act
      // Both clients delete 'b' concurrently
      const deletePosA = docA.resolvePosition(1);
      deletePosA.right.delete();

      const deletePosB = docB.resolvePosition(1);
      deletePosB.right.delete();

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'ac');

      // Should still only have one deleted item 'b'
      const deletedItems = docA.toArray().filter((item) => item.deleted);
      expect(deletedItems.length).toBe(1);
      expect(deletedItems[0].text).toBe('b');
    });
  });

  describe('Complex Document Structures', () => {
    test('D1: paragraph with text synchronization', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A creates paragraph with text
      const paragraphNode = schema.node('paragraph', null, [
        schema.text('hello'),
      ]);
      const docWithContent = Document.fromNodes(Fragment.from([paragraphNode]));
      docWithContent.client = 'client-0';

      // Replace docA with this new doc
      docs[0] = docWithContent;

      // Sync to B
      const itemsA = docWithContent.toItems();
      docB.applyItems(itemsA);

      // Assert
      expectDocHTML(docWithContent, '<paragraph>hello</paragraph>');
      expectDocHTML(docB, '<paragraph>hello</paragraph>');

      // Verify structure: OpeningTag + 5 TextItems + ClosingTag = 7 items
      expectDocSize(docWithContent, 7);
      expectDocSize(docB, 7);
    });

    test('D2: nested list structure synchronization', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A creates bullet list with items
      const listNode = schema.node('bullet_list', null, [
        schema.node('list_item', null, [
          schema.node('paragraph', null, [schema.text('item 1')]),
        ]),
        schema.node('list_item', null, [
          schema.node('paragraph', null, [schema.text('item 2')]),
        ]),
      ]);

      const docWithList = Document.fromNodes(Fragment.from([listNode]));
      docWithList.client = 'client-0';
      docs[0] = docWithList;

      // Sync to B
      const itemsA = docWithList.toItems();
      docB.applyItems(itemsA);

      // Assert
      const expectedHTML =
        '<bullet_list><list_item><paragraph>item 1</paragraph></list_item><list_item><paragraph>item 2</paragraph></list_item></bullet_list>';
      expectDocHTML(docWithList, expectedHTML);
      expectDocHTML(docB, expectedHTML);

      // Verify both docs have same structure
      const itemsB = docB.toArray();
      const itemsAArray = docWithList.toArray();
      expect(itemsB.length).toBe(itemsAArray.length);
    });

    test('D3: paragraph tag balancing after concurrent edits', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Both clients start with a paragraph
      const paragraphNode = schema.node('paragraph', null, [schema.text('ab')]);
      const initialDoc = Document.fromNodes(Fragment.from([paragraphNode]));

      // Clone to both clients
      const itemsInit = initialDoc.toItems();
      docA.applyItems(itemsInit);
      docB.applyItems(itemsInit);

      // Act
      // Client A inserts 'x' at start of paragraph content
      const posA = docA.resolvePosition(1); // After opening tag
      new TextItem('x').integrate(posA);

      // Client B inserts 'y' at end of paragraph content
      const posB = docB.resolvePosition(3); // After 'ab', before closing tag
      new TextItem('y').integrate(posB);

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, '<paragraph>xaby</paragraph>');

      // Verify tags are still balanced
      const items = docA.toArray().filter((item) => !item.deleted);
      const openingTags = items.filter(
        (item) => item instanceof OpeningTagItem,
      );
      const closingTags = items.filter(
        (item) => item instanceof ClosingTagItem,
      );
      expect(openingTags.length).toBe(1);
      expect(closingTags.length).toBe(1);
      expect(openingTags[0].closingTagItem).toBe(closingTags[0]);
      expect(closingTags[0].openingTagItem).toBe(openingTags[0]);
    });
  });

  describe('Edge Cases', () => {
    test('E1: out-of-order item integration', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A creates "abc"
      const posA = new Position(docA);
      const itemA = new TextItem('a');
      const itemB = new TextItem('b');
      const itemC = new TextItem('c');

      itemA.integrate(posA);
      itemB.integrate(posA);
      itemC.integrate(posA);

      // Simulate out-of-order arrival: send 'c' first, then 'a', then 'b'
      const itemsMap = docA.toItems();
      const items = itemsMap[docA.client];

      // Apply in different order to docB
      docB.applyItems({ [docA.client]: [items[2]] }); // 'c'
      docB.applyItems({ [docA.client]: [items[0]] }); // 'a'
      docB.applyItems({ [docA.client]: [items[1]] }); // 'b'

      // Assert
      // Should still converge to correct order
      expectDocHTML(docA, 'abc');
      expectDocHTML(docB, 'abc');
    });

    test('E2: idempotent application - applying same items twice is no-op', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A creates "hello"
      const pos = new Position(docA);
      createTextItems('hello').forEach((item) => item.integrate(pos));

      // Sync to B
      const itemsA = docA.toItems();
      docB.applyItems(itemsA);

      // Apply same items again
      docB.applyItems(itemsA);

      // Assert
      expectDocHTML(docB, 'hello');
      expectDocSize(docB, 5);

      // Verify no duplicate items
      const allItems = docB.toArray();
      expect(allItems.length).toBe(5);
    });

    test('E3: integration when originalLeft is deleted', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Both start with "ac"
      const pos = new Position(docA);
      const itemA = new TextItem('a');
      const itemC = new TextItem('c');
      itemA.integrate(pos);
      itemC.integrate(pos);
      syncBidirectional(docA, docB);

      // Act
      // Client A deletes 'a'
      const deletePos = docA.resolvePosition(0);
      deletePos.right.delete();

      // Client B inserts 'b' between 'a' and 'c' (before knowing 'a' is deleted)
      const insertPos = docB.resolvePosition(1);
      new TextItem('b').integrate(insertPos);

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      // 'a' is deleted, 'b' and 'c' remain
      expectDocHTML(docA, 'bc');
    });

    test('E4: integration when originalRight is deleted', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Both start with "ac"
      const pos = new Position(docA);
      const itemA = new TextItem('a');
      const itemC = new TextItem('c');
      itemA.integrate(pos);
      itemC.integrate(pos);
      syncBidirectional(docA, docB);

      // Act
      // Client A deletes 'c'
      const deletePos = docA.resolvePosition(1);
      deletePos.right.delete();

      // Client B inserts 'b' between 'a' and 'c' (before knowing 'c' is deleted)
      const insertPos = docB.resolvePosition(1);
      new TextItem('b').integrate(insertPos);

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      // 'c' is deleted, 'a' and 'b' remain
      expectDocHTML(docA, 'ab');
    });

    test('E5: large concurrent batch operations', () => {
      // Arrange
      const docs = createMultiClientScenario(2);
      const [docA, docB] = docs;

      // Act
      // Client A inserts 100 characters
      const posA = new Position(docA);
      for (let i = 0; i < 100; i++) {
        new TextItem('a').integrate(posA);
      }

      // Client B inserts 100 characters
      const posB = new Position(docB);
      for (let i = 0; i < 100; i++) {
        new TextItem('b').integrate(posB);
      }

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocSize(docA, 200);

      // Verify all 'a's come before 'b's (due to client ID ordering)
      const html = docA.toHTMLString();
      expect(html.indexOf('b')).toBe(100); // First 'b' at position 100
    });

    test('E6: documents with many tombstones maintain correctness', () => {
      // Arrange
      const doc = new Document('client-0');

      // Create "abcdefghij" (10 characters)
      const pos = new Position(doc);
      const chars = 'abcdefghij'.split('');
      chars.forEach((char) => {
        new TextItem(char).integrate(pos);
      });

      // Act
      // Delete every other character (5 deletions)
      // Get all items first, then delete them (positions shift after each deletion)
      const allItems = doc.toArray();
      for (let i = 0; i < 10; i += 2) {
        allItems[i].delete();
      }

      // Assert
      expectDocHTML(doc, 'bdfhj');

      // Verify tombstones
      expect(allItems.length).toBe(10);
      const deletedItems = allItems.filter((item) => item.deleted);
      expect(deletedItems.length).toBe(5);

      // Verify linked list integrity maintained
      for (let i = 0; i < allItems.length - 1; i++) {
        expectItemsLinked(allItems[i], allItems[i + 1]);
      }
    });
  });

  describe('Serialization Round-Trip', () => {
    test('F1: toItems produces consistent client map structure', () => {
      // Arrange
      const doc = new Document('client-test');
      const pos = new Position(doc);
      createTextItems('hello').forEach((item) => item.integrate(pos));

      // Act
      const items = doc.toItems();

      // Assert
      expect(Object.keys(items)).toEqual(['client-test']);
      expect(items['client-test'].length).toBe(5);

      // Verify each item has correct client ID and sequential clocks
      items['client-test'].forEach((item, i) => {
        expectItemId(item, 'client-test', i);
      });
    });

    test('F2: applyItems correctly reconstructs document state', () => {
      // Arrange
      const docA = new Document('client-A');
      const posA = new Position(docA);

      // Create paragraph with text
      const paragraphItems = createParagraphItems('test');
      paragraphItems.forEach((item) => item.integrate(posA));

      // Act
      const docB = new Document('client-B');
      const itemsA = docA.toItems();
      docB.applyItems(itemsA);

      // Assert
      expectDocHTML(docA, '<paragraph>test</paragraph>');
      expectDocHTML(docB, '<paragraph>test</paragraph>');

      // Verify same item count
      expect(docB.toArray().length).toBe(docA.toArray().length);
    });

    test('F3: round-trip serialization preserves document identity', () => {
      // Arrange
      const originalDoc = new Document('original');
      const pos = new Position(originalDoc);

      // Create complex structure
      const items = [
        new OpeningTagItem('paragraph'),
        ...createTextItems('hello'),
        new ClosingTagItem('paragraph'),
      ];
      items[0].closingTagItem = items[items.length - 1];
      items[items.length - 1].openingTagItem = items[0];
      items.forEach((item) => item.integrate(pos));

      // Act
      // Serialize and deserialize
      const serialized = originalDoc.toItems();
      const reconstructedDoc = new Document('reconstructed');
      reconstructedDoc.applyItems(serialized);

      // Assert
      expectDocHTML(originalDoc, '<paragraph>hello</paragraph>');
      expectDocHTML(reconstructedDoc, '<paragraph>hello</paragraph>');

      // Verify item structure matches
      const originalItems = originalDoc.toArray();
      const reconstructedItems = reconstructedDoc.toArray();
      expect(reconstructedItems.length).toBe(originalItems.length);
    });
  });
});
