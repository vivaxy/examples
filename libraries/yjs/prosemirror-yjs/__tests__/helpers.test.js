/**
 * @since 2021-11-08
 * @author vivaxy
 */
import * as Y from 'yjs';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { Schema, DOMParser, Slice, Fragment } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';

import { insert, remove, format, p2y } from '../helpers';

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
  const pDoc = createPDocFromHTML(`<p>12<em>34</em>567890</p>`);
  const type = createXmlFragment();
  p2y(pDoc, type);
  expect(type.toJSON()).toStrictEqual(
    `<paragraph>12<em>34</em>567890</paragraph>`,
  );
});

test('remove text', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  remove(type, schema, 1, 1);
  expect(type.toJSON()).toStrictEqual(`<paragraph>234567890</paragraph>`);
  remove(type, schema, 1, 1);
  expect(type.toJSON()).toStrictEqual(`<paragraph>34567890</paragraph>`);
  remove(type, schema, 1, 9);
  expect(type.toJSON()).toStrictEqual(`<paragraph></paragraph>`);
});

test('remove node', function () {});

test('remove structure', function () {});

test('remove mark', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  format(type, schema, 1, 2, { em: {} });
  format(type, schema, 1, 2, { em: null });
  expect(type.toJSON()).toStrictEqual(`<paragraph>1234567890</paragraph>`);
});

test('insert', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  insert(type, schema, 1, new Slice(Fragment.from(schema.text('a'))));
  expect(type.toJSON()).toStrictEqual(`<paragraph>a1234567890</paragraph>`);
  insert(type, schema, 2, new Slice(Fragment.from(schema.text('b'))));
  expect(type.toJSON()).toStrictEqual(`<paragraph>ab1234567890</paragraph>`);
});

test('insert structure', function () {});

test('insert node', function () {});

test('add mark', function () {
  const type = createXmlFragment();
  p2y(createPDocFromHTML(`<p>1234567890</p>`), type);
  format(type, schema, 1, 3, { em: {} });
  expect(type.toJSON()).toStrictEqual(
    `<paragraph><em>12</em>34567890</paragraph>`,
  );
});
