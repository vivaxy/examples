/**
 * @since 2021-06-18
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.view = view;

const $from = document.getElementById('from');
const $to = document.getElementById('to');
const $slice = document.getElementById('slice');
$slice.addEventListener('click', function () {
  console.log(view.state.doc.slice($from.value, $to.value).toString());
});
