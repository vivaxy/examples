/**
 * @since 2021-06-21
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

const $pos = document.getElementById('pos');
const $resolve = document.getElementById('resolve');
$resolve.addEventListener('click', function () {
  const pos = Number($pos.value);
  const resolvedPos = view.state.doc.resolve(pos);
  console.log(
    'depth',
    resolvedPos.depth,
    'parentOffset',
    resolvedPos.parentOffset,
  );
});
