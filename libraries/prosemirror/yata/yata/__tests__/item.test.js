import { Fragment, Slice } from 'prosemirror-model';
import schema from '../../schema.js';
import {
  nodeToItems,
  OpeningTagItem,
  ClosingTagItem,
  itemsToSlice,
  TextItem,
  NodeItem,
  sliceToItems,
} from '../item.js';
import { Document, Position } from '../document.js';

describe('nodeToItems', function () {
  test('all nodes', function () {
    const node = schema.node('paragraph', null, [
      schema.text('123', schema.mark('em')),
      schema.node('image', { src: 'a' }),
    ]);
    const items = nodeToItems(node);
    expect(items.length).toBe(node.nodeSize);
  });
});

describe('itemsToSlice and fragmentToItems', function () {
  test('all items', function () {
    const items = [
      new OpeningTagItem('paragraph'),
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
      schema.text('123', schema.mark('em')),
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
