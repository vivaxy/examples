/**
 * @since 2021-07-05
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, NodeRange } from 'prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
});

const $from = view.state.doc.resolve(6);
// const $to = view.state.doc.resolve(6);
const $to = view.state.doc.resolve(7);
// const $to = view.state.doc.resolve(10);
const nodeRange = new NodeRange($from, $to, 1);
console.log('nodeRange', nodeRange);
