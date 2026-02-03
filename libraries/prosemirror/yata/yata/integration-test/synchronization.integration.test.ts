/**
 * Integration tests for YATA Document Synchronization
 * Tests CRDT convergence properties across concurrent editing scenarios
 */

import { describe, test, expect } from 'vitest';
import { Fragment, Slice } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { ReplaceStep } from 'prosemirror-transform';
import { exampleSetup } from 'prosemirror-example-setup';
import schema from '../../example/schema.js';
import { Document, Position } from '../document.js';
import { TextItem, OpeningTagItem, ClosingTagItem } from '../item.js';
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
} from '../__tests__/helpers/test-helpers.js';

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
      docB.applyItems(itemsA, schema);

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
      docA.applyItems(itemsB, schema);

      const itemsA = docA.toItems();
      docB.applyItems(itemsA, schema);

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
      deletePos.right!.delete(); // Delete 'b'

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
      expect((deletedItems[0] as TextItem).text).toBe('b');
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
      deletePosB.right!.delete(); // Delete 'a'

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
      const itemY = deletePos.right!;
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
      expect((deletedItem as TextItem).text).toBe('y');
      expect(deletedItem!.deleted).toBe(true);

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
      deletePosA.right!.delete();

      // Client B deletes 'd' (concurrent)
      const deletePosB = docB.resolvePosition(3);
      deletePosB.right!.delete();

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
      deletePosA.right!.delete();

      const deletePosB = docB.resolvePosition(1);
      deletePosB.right!.delete();

      // Sync
      synchronizeDocs(docs);

      // Assert
      assertConvergence(docs);
      expectDocHTML(docA, 'ac');

      // Should still only have one deleted item 'b'
      const deletedItems = docA.toArray().filter((item) => item.deleted);
      expect(deletedItems.length).toBe(1);
      expect((deletedItems[0] as TextItem).text).toBe('b');
    });
  });

  describe('Complex Document Structures', () => {
    test('D0: empty paragraph receives text insertion via ReplaceStep and syncs', () => {
      // Arrange
      // Create two documents with empty paragraph using EditorState pattern
      const state1 = EditorState.create({
        schema,
        plugins: exampleSetup({ schema }),
      });
      const doc1 = Document.fromNodes(state1.doc.content);

      const doc2 = new Document(doc1.client);
      doc2.applyItems(doc1.toItems(), schema);

      // Both should start with empty paragraph
      expectDocHTML(doc1, '<paragraph></paragraph>');
      expectDocHTML(doc2, '<paragraph></paragraph>');

      // Act
      // Insert 'x' at position 1 (inside paragraph) using ReplaceStep
      const step = new ReplaceStep(
        1,
        1,
        new Slice(Fragment.from([schema.text('x')]), 0, 0),
      );
      doc1.applyStep(step);

      // Sync to doc2
      const items1 = doc1.toItems();
      doc2.applyItems(items1, schema);

      // Assert
      // Both documents should have 'x' inside paragraph
      expectDocHTML(doc1, '<paragraph>x</paragraph>');
      expectDocHTML(doc2, '<paragraph>x</paragraph>');

      // Verify structure: OpeningTag + TextItem('x') + ClosingTag = 3 items
      expectDocSize(doc1, 3);
      expectDocSize(doc2, 3);

      // Verify ProseMirror conversion for doc2
      const proseMirrorDoc2 = doc2.toProseMirrorDoc(schema);
      expect(proseMirrorDoc2.childCount).toBe(1);
      expect(proseMirrorDoc2.firstChild!.type.name).toBe('paragraph');
      expect(proseMirrorDoc2.firstChild!.textContent).toBe('x');
    });

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
      docB.applyItems(itemsA, schema);

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
      docB.applyItems(itemsA, schema);

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
      docA.applyItems(itemsInit, schema);
      docB.applyItems(itemsInit, schema);

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
      expect((openingTags[0] as OpeningTagItem).targetId).toEqual(
        closingTags[0].id,
      );
      expect((closingTags[0] as ClosingTagItem).targetId).toEqual(
        openingTags[0].id,
      );
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
      docB.applyItems({ [docA.client]: [items[2]] }, schema); // 'c'
      docB.applyItems({ [docA.client]: [items[0]] }, schema); // 'a'
      docB.applyItems({ [docA.client]: [items[1]] }, schema); // 'b'

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
      docB.applyItems(itemsA, schema);

      // Apply same items again
      docB.applyItems(itemsA, schema);

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
      deletePos.right!.delete();

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
      deletePos.right!.delete();

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
        expect(item.id.client).toBe('client-test');
        expect(item.id.clock).toBe(i);
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
      docB.applyItems(itemsA, schema);

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
      // Note: Tag pairing happens during integration via ClosingTagItem.integrate()
      const items = [
        new OpeningTagItem('paragraph', null),
        ...createTextItems('hello'),
        new ClosingTagItem('paragraph'),
      ];
      items.forEach((item) => item.integrate(pos));

      // Act
      // Serialize and deserialize
      const serialized = originalDoc.toItems();
      const reconstructedDoc = new Document('reconstructed');
      reconstructedDoc.applyItems(serialized, schema);

      // Assert
      expectDocHTML(originalDoc, '<paragraph>hello</paragraph>');
      expectDocHTML(reconstructedDoc, '<paragraph>hello</paragraph>');

      // Verify item structure matches
      const originalItems = originalDoc.toArray();
      const reconstructedItems = reconstructedDoc.toArray();
      expect(reconstructedItems.length).toBe(originalItems.length);
    });
  });

  describe('ReplaceStep Edge Cases', () => {
    test('inserting closing and opening tags in empty paragraph creates valid document', () => {
      // Arrange
      // Create document starting with <p></p>
      const doc = Document.fromNodes(
        Fragment.from([schema.node('paragraph', null)]),
      );

      // Verify initial state
      expectDocHTML(doc, '<paragraph></paragraph>');

      // Act
      // Apply ReplaceStep to insert </p><p> at position 1 (inside the paragraph)
      // In ProseMirror, splitting an empty paragraph is represented as a Slice with:
      // - Two empty paragraph nodes in the Fragment
      // - openStart=1 (we're starting inside the first paragraph)
      // - openEnd=1 (we're ending inside the second paragraph)
      // This effectively inserts: closing tag of first paragraph + opening tag of second
      const slice = new Slice(
        Fragment.from([
          schema.node('paragraph', null),
          schema.node('paragraph', null),
        ]),
        1,
        1,
      );

      const step = new ReplaceStep(1, 1, slice);
      doc.applyStep(step);

      // Assert
      // Should result in two empty paragraphs: <p></p><p></p>
      expectDocHTML(doc, '<paragraph></paragraph><paragraph></paragraph>');

      // Verify document is valid and can be converted to ProseMirror
      const proseMirrorDoc = doc.toProseMirrorDoc(schema);
      expect(proseMirrorDoc.childCount).toBe(2);
      expect(proseMirrorDoc.child(0).type.name).toBe('paragraph');
      expect(proseMirrorDoc.child(1).type.name).toBe('paragraph');
      expect(proseMirrorDoc.child(0).textContent).toBe('');
      expect(proseMirrorDoc.child(1).textContent).toBe('');

      // Verify tags are balanced
      const items = doc.toArray().filter((item) => !item.deleted);
      const openingTags = items.filter(
        (item) => item instanceof OpeningTagItem,
      );
      const closingTags = items.filter(
        (item) => item instanceof ClosingTagItem,
      );
      expect(openingTags.length).toBe(2);
      expect(closingTags.length).toBe(2);
    });
  });

  describe('Paragraph Merge Sync Issue', () => {
    test('deleting closing and opening tags between paragraphs should sync without error', () => {
      // Arrange: Create two synced documents with <p>1</p><p>2</p>
      const doc1 = new Document('client1');
      const doc2 = new Document('client2');

      // Create initial content: <p>1</p><p>2</p>
      const items = [
        new OpeningTagItem('paragraph', null),
        new TextItem('1'),
        new ClosingTagItem('paragraph'),
        new OpeningTagItem('paragraph', null),
        new TextItem('2'),
        new ClosingTagItem('paragraph'),
      ];

      const pos1 = new Position(doc1);
      items.forEach((item) => item.integrate(pos1));

      // Sync to doc2
      syncBidirectional(doc1, doc2);

      // Verify initial state
      expectDocHTML(doc1, '<paragraph>1</paragraph><paragraph>2</paragraph>');
      expectDocHTML(doc2, '<paragraph>1</paragraph><paragraph>2</paragraph>');

      // Act: Delete the closing tag of first paragraph and opening tag of second paragraph
      // This is equivalent to merging the two paragraphs
      // In ProseMirror editor, this would be positions 2-4 (after <p>1, before 2</p>)
      // Position 0: start
      // Position 1: after opening <p>
      // Position 2: after "1"
      // Position 3: after </p> (first closing tag)
      // Position 4: after <p> (second opening tag)
      // Position 5: after "2"
      // Position 6: after </p> (second closing tag)

      // Delete from position 2 to position 4 (deletes </p><p>)
      doc1.replaceItems(2, 4, []);

      // Verify doc1 state after deletion
      const doc1Items = doc1.toArray();
      console.log('Doc1 items after deletion:', visualizeItemChain(doc1));

      // Sync doc1 changes to doc2
      // This should not throw "Inconsistent open depths" error
      const items1 = doc1.toItems();

      // This is where the error occurs
      expect(() => {
        const steps = doc2.applyItems(items1, schema);

        // Apply steps to a mock editor state to verify they work
        const mockState = EditorState.create({
          schema,
          doc: schema.node('doc', null, [
            schema.node('paragraph', null, [schema.text('1')]),
            schema.node('paragraph', null, [schema.text('2')]),
          ]),
        });

        let tr = mockState.tr;
        for (const step of steps) {
          tr = tr.step(step);
        }
      }).not.toThrow();
    });
  });
});
