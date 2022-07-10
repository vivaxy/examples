import { Slice, Fragment } from 'prosemirror-model';
import { ReplaceStep, ReplaceAroundStep } from 'prosemirror-transform';
import schema from '../../schema.js';
import { Position, Document } from '../document.js';
import { ClosingTagItem, Item, OpeningTagItem, TextItem } from '../item.js';

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

describe('applyStep', function () {
  test('ReplaceStep', function () {
    const doc = new Document();
    doc.replaceItems(0, 0, [
      new OpeningTagItem('paragraph'),
      new TextItem('1'),
      new ClosingTagItem('paragraph'),
    ]);
    doc.applyStep(
      new ReplaceStep(
        1,
        3,
        new Slice(
          new Fragment([schema.node('paragraph', null, [schema.text('2')])]),
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
