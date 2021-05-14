/**
 * @since 2021-05-14
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';
import { Mapping } from 'prosemirror-transform';

const $content = document.querySelector('#content');
const $editor = document.querySelector('#editor');

const originalState = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse($content),
});

const mapping = new Mapping();

const view = new EditorView($editor, {
  state: originalState,
  dispatchTransaction(transaction) {
    const newState = view.state.apply(transaction);
    if (transaction.docChanged) {
      mapping.appendMapping(transaction.mapping);
      console.log('mapping', mapping);
    }
    view.updateState(newState);
  },
});

document.querySelector('#sync').addEventListener('click', function () {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount <= 0) {
    console.error('Please select in the document.');
    return;
  }

  const range = selection.getRangeAt(0);
  const { startContainer, startOffset, endContainer, endOffset } = range;

  if (!$content.contains(startContainer) || !$content.contains(endContainer)) {
    console.error('Please select in the document.');
    return;
  }

  let from = startOffset + 1;
  let to = endOffset + 1;
  from = mapping.map(from);
  to = mapping.map(to);

  const sel = TextSelection.create(view.state.doc, from, to);
  const tr = view.state.tr;

  tr.setSelection(sel);
  const newState = view.state.apply(tr);
  view.updateState(newState);
  view.focus();
});
