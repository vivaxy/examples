import { describe, test, expect } from 'vitest';
import { Slice, Fragment } from 'prosemirror-model';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';
import schema from '../../example/schema.js';
import { Position, Document } from '../document.js';
import { ClosingTagItem, Item, OpeningTagItem, TextItem } from '../item.js';

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
