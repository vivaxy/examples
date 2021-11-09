/**
 * @since 2021-11-08
 * @author vivaxy
 */
import * as Y from 'yjs';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { Schema, DOMParser, Slice, Fragment } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';

import { insert, remove, p2y } from '../helpers';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

function createPDocFromHTML(html) {
  const dom = document.createElement('div');
  dom.innerHTML = html;
  return DOMParser.fromSchema(schema).parse(dom);
}

function createXmlFragment() {
  const yDoc = new Y.Doc();
  return yDoc.getXmlFragment('prosemirror');
}

test('p2y', function () {
  const pDoc = createPDocFromHTML(`<p>1234567890</p>`);
  const type = createXmlFragment();
  p2y(pDoc, type);
  expect(type.toJSON()).toStrictEqual(`<paragraph>1234567890</paragraph>`);
});

test('remove', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  remove(type, schema, 1, 1);
  expect(type.toJSON()).toStrictEqual(`<paragraph>234567890</paragraph>`);
  remove(type, schema, 1, 1);
  expect(type.toJSON()).toStrictEqual(`<paragraph>34567890</paragraph>`);
});

test('insert', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  insert(type, schema, 1, new Slice(Fragment.from(schema.text('a'))));
  expect(type.toJSON()).toStrictEqual(`<paragraph>a1234567890</paragraph>`);
  insert(type, schema, 2, new Slice(Fragment.from(schema.text('b'))));
  expect(type.toJSON()).toStrictEqual(`<paragraph>ab1234567890</paragraph>`);
});
