/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

const $content = document.querySelector('#content');
const find = {
  node: $content.querySelector('p').childNodes[0],
  offset: 2,
};
const doc = DOMParser.fromSchema(schema).parse($content, {
  preserveWhitespace: 'full',
  findPositions: [find],
});

console.log('find.pos', find.pos);

const state = EditorState.create({
  schema,
  doc,
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
});
