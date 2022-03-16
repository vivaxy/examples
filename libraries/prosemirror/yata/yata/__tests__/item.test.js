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

describe('nodeToItems', function () {
  test('all nodes', function () {
    const node = schema.node('paragraph', null, [
      schema.text('123', schema.mark('em')),
      schema.node('image', { src: 'a' }),
    ]);
    const items = nodeToItems(node);
    expect(items.length).toBe(node.nodeSize);
    expect(
      items.map((item) => {
        return item.toJSON();
      }),
    ).toEqual([
      {
        attrs: {},
        tagName: 'paragraph',
        type: 'openingTag',
        closingId: null,
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '1',
        type: 'text',
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '2',
        type: 'text',
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '3',
        type: 'text',
      },
      {
        attrs: {
          alt: null,
          src: 'a',
          title: null,
        },
        tagName: 'image',
        type: 'node',
      },
      {
        tagName: 'paragraph',
        type: 'closingTag',
        openingId: null,
      },
    ]);
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
    expect(
      items.map((item) => {
        return item.toJSON();
      }),
    ).toEqual([
      {
        tagName: 'paragraph',
        type: 'closingTag',
        openingId: null,
      },
      {
        attrs: {},
        tagName: 'paragraph',
        type: 'openingTag',
        closingId: null,
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '1',
        type: 'text',
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '2',
        type: 'text',
      },
      {
        marks: [
          {
            type: 'em',
          },
        ],
        text: '3',
        type: 'text',
      },
      {
        attrs: {
          alt: null,
          src: 'a',
          title: null,
        },
        tagName: 'image',
        type: 'node',
      },
      {
        tagName: 'paragraph',
        type: 'closingTag',
        openingId: null,
      },
    ]);
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
