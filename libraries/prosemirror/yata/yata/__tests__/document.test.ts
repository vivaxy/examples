import { describe, test, expect } from 'vitest';
import { Slice, Fragment } from 'prosemirror-model';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';
import schema from '../../example/schema.js';
import { Position, Document } from '../document.js';
import {
  ClosingTagItem,
  Item,
  OpeningTagItem,
  TextItem,
  fragmentToItems,
} from '../item.js';

const emptyDoc = new Document();

describe('document', function () {
  test('replaceItems with empty doc', function () {
    const doc = new Document();
    doc.replaceItems(0, 0, [new Item()]);
    expect(doc.head!.id!.client).toBe(doc.client);
    expect(doc.head!.id!.clock).toBe(0);
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

describe('applyStep', function () {
  test('ReplaceStep', function () {
    const doc = new Document();
    doc.replaceItems(0, 0, [
      new OpeningTagItem('paragraph', null),
      new TextItem('1'),
      new ClosingTagItem('paragraph'),
    ]);
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
    expect(doc.toHTMLString()).toBe('<paragraph>2</paragraph>');
    expect(doc.toArray().length).toBe(5);
  });

  test('ReplaceAroundStep', function () {
    const doc = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('1')])]),
    );
    doc.applyStep(
      new ReplaceAroundStep(
        0,
        3,
        1,
        2,
        new Slice(Fragment.from(schema.node('heading', { level: 1 })), 0, 0),
        1,
      ),
    );
    expect(doc.toHTMLString()).toBe('<heading level="1">1</heading>');
    expect(doc.toArray().length).toBe(5);
  });
});

describe('toItems', function () {
  test('doc to items', function () {
    const doc = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('1')])]),
    );
    const items = doc.toItems();
    const keys = Object.keys(items);
    expect(keys.length).toStrictEqual(1);
    expect(items[keys[0]].length).toStrictEqual(3);
    const [item1, item2, item3] = items[keys[0]];
    expect(item1.id.clock).toStrictEqual(0);
    expect(item2.id.clock).toStrictEqual(1);
    expect(item3.id.clock).toStrictEqual(2);
  });
});

describe('toProseMirrorDoc', function () {
  test('should convert simple paragraph', function () {
    // Arrange
    const doc = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('hello')])]),
    );

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(1);
    expect(proseMirrorDoc.firstChild!.type.name).toBe('paragraph');
    expect(proseMirrorDoc.firstChild!.textContent).toBe('hello');
  });

  test('should convert multiple paragraphs', function () {
    // Arrange
    const doc = Document.fromNodes(
      Fragment.from([
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    );

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(2);
    expect(proseMirrorDoc.child(0).textContent).toBe('first');
    expect(proseMirrorDoc.child(1).textContent).toBe('second');
  });

  test('should exclude deleted items', function () {
    // Arrange
    const doc = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('hello')])]),
    );

    // Delete all text items (positions 1-5: h, e, l, l, o)
    for (let i = 1; i <= 5; i++) {
      const pos = doc.resolvePosition(1);
      pos.right!.delete();
    }

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(1);
    expect(proseMirrorDoc.firstChild!.type.name).toBe('paragraph');
    expect(proseMirrorDoc.firstChild!.textContent).toBe('');
  });

  test('should convert heading nodes', function () {
    // Arrange
    const doc = Document.fromNodes(
      Fragment.from([
        schema.node('heading', { level: 1 }, [schema.text('Title')]),
      ]),
    );

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(1);
    expect(proseMirrorDoc.firstChild!.type.name).toBe('heading');
    expect(proseMirrorDoc.firstChild!.attrs.level).toBe(1);
    expect(proseMirrorDoc.firstChild!.textContent).toBe('Title');
  });

  test('should convert nested list structures', function () {
    // Arrange
    const originalFragment = Fragment.from([
      schema.node('bullet_list', null, [
        schema.node('list_item', null, [
          schema.node('paragraph', null, [schema.text('item 1')]),
        ]),
        schema.node('list_item', null, [
          schema.node('paragraph', null, [schema.text('item 2')]),
        ]),
      ]),
    ]);
    const doc = Document.fromNodes(originalFragment);

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(1);
    expect(proseMirrorDoc.firstChild!.type.name).toBe('bullet_list');
    expect(proseMirrorDoc.firstChild!.childCount).toBe(2);
    expect(proseMirrorDoc.firstChild!.child(0).type.name).toBe('list_item');
    expect(proseMirrorDoc.firstChild!.child(0).firstChild!.textContent).toBe(
      'item 1',
    );
    expect(proseMirrorDoc.firstChild!.child(1).firstChild!.textContent).toBe(
      'item 2',
    );
  });

  test('should handle empty document', function () {
    // Arrange
    const doc = new Document();

    // Act
    const proseMirrorDoc = doc.toProseMirrorDoc(schema);

    // Assert
    expect(proseMirrorDoc.type.name).toBe('doc');
    expect(proseMirrorDoc.childCount).toBe(0);
  });
});

describe('applyItems - step generation', function () {
  test('should return empty array when no changes', function () {
    // Arrange
    const doc1 = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('hello')])]),
    );
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // Act - apply same items again (idempotent)
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps).toEqual([]);
  });

  test('should return insert step for single text insertion', function () {
    // Arrange
    const doc1 = new Document('client-1');
    const doc2 = new Document('client-2');

    // doc1 inserts 'x' wrapped in a paragraph
    const pos = new Position(doc1);
    new OpeningTagItem('paragraph', null).integrate(pos);
    new TextItem('x').integrate(pos);
    new ClosingTagItem('paragraph').integrate(pos);

    // Act - sync to doc2
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps.length).toBe(1);
    expect(steps[0]).toBeInstanceOf(ReplaceStep);
    expect(steps[0].from).toBe(0);
    expect(steps[0].to).toBe(0);
    expect(steps[0].slice.content.firstChild!.textContent).toBe('x');
  });

  test('should return delete step for single deletion', function () {
    // Arrange
    const doc1 = Document.fromNodes(
      Fragment.from([schema.node('paragraph', null, [schema.text('abc')])]),
    );
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // doc1 deletes 'b' (middle character at position 2)
    const deletePos = doc1.resolvePosition(2);
    deletePos.right!.delete();

    // Act - sync deletion to doc2
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps.length).toBe(1);
    expect(steps[0]).toBeInstanceOf(ReplaceStep);
    expect(steps[0].from).toBe(2);
    expect(steps[0].to).toBe(3);
    expect(steps[0].slice.content.size).toBe(0); // empty slice for deletion
  });

  test('should group adjacent insertions into single step', function () {
    // Arrange
    const doc1 = new Document('client-1');
    const doc2 = new Document('client-2');

    // doc1 inserts 'abc' as three adjacent items wrapped in a paragraph
    const pos = new Position(doc1);
    new OpeningTagItem('paragraph', null).integrate(pos);
    new TextItem('a').integrate(pos);
    new TextItem('b').integrate(pos);
    new TextItem('c').integrate(pos);
    new ClosingTagItem('paragraph').integrate(pos);

    // Act - sync to doc2
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps.length).toBe(1); // grouped into single step
    expect(steps[0].from).toBe(0);
    expect(steps[0].to).toBe(0);
    expect(steps[0].slice.content.firstChild!.textContent).toBe('abc');
  });

  test('should return multiple steps for non-adjacent changes', function () {
    // Arrange
    const doc1 = Document.fromNodes(
      Fragment.from([
        schema.node('paragraph', null, [schema.text('first')]),
        schema.node('paragraph', null, [schema.text('second')]),
      ]),
    );
    const doc2 = new Document();
    doc2.applyItems(doc1.toItems(), schema);

    // doc1 makes changes: insert at position 1, delete at position 9
    const pos1 = doc1.resolvePosition(1);
    new TextItem('X').integrate(pos1);

    // Note: After inserting at position 1, positions have shifted
    // Original position 8 is now position 9
    const deletePos = doc1.resolvePosition(9);
    deletePos.right!.delete();

    // Act - sync to doc2
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps.length).toBe(2); // separate steps for non-adjacent changes
    // First step: bare text insertion at YATA position 1
    expect(steps[0].from).toBe(1);
    expect(steps[0].to).toBe(1);
    // Second step: deletion at YATA position 8 (in doc2's coordinate system)
    // Note: These are YATA positions which include tag items, not ProseMirror positions
    expect(steps[1].from).toBe(8);
    expect(steps[1].to).toBe(9);
  });

  test('should handle paragraph insertion with tags', function () {
    // Arrange
    const doc1 = new Document('client-1');
    const doc2 = new Document('client-2');

    // doc1 creates a paragraph with text
    const fragment = Fragment.from([
      schema.node('paragraph', null, [schema.text('test')]),
    ]);
    const items = fragmentToItems(fragment);
    const pos = new Position(doc1);
    items.forEach((item) => item.integrate(pos));

    // Act - sync to doc2
    const steps = doc2.applyItems(doc1.toItems(), schema);

    // Assert
    expect(steps.length).toBe(1);
    expect(steps[0]).toBeInstanceOf(ReplaceStep);

    // Verify the step creates the correct structure
    const slice = steps[0].slice;
    expect(slice.content.childCount).toBe(1);
    expect(slice.content.firstChild!.type.name).toBe('paragraph');
    expect(slice.content.firstChild!.textContent).toBe('test');
  });

  test('should handle concurrent insertions at same position', function () {
    // Arrange
    const doc1 = new Document('client-0');
    const doc2 = new Document('client-1');

    // Both insert at position 0 concurrently
    const pos1 = new Position(doc1);
    new TextItem('a').integrate(pos1);

    const pos2 = new Position(doc2);
    new TextItem('b').integrate(pos2);

    // Act - sync both ways
    const stepsToDoc2 = doc2.applyItems(doc1.toItems(), schema);
    const stepsToDoc1 = doc1.applyItems(doc2.toItems(), schema);

    // Assert - both should get insert steps
    expect(stepsToDoc2.length).toBe(1);
    expect(stepsToDoc1.length).toBe(1);

    // Verify final convergence (CRDT ordering: client-0 < client-1)
    expect(doc1.toHTMLString()).toBe('ab');
    expect(doc2.toHTMLString()).toBe('ab');
  });
});
