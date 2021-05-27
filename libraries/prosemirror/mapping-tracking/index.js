/**
 * @since 2021-05-14
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';
import { Mapping, StepMap } from 'prosemirror-transform';

const $content = document.querySelector('#content');
const $editor = document.querySelector('#editor');

const originalState = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse($content),
});

let mappings = [];

const view = new EditorView($editor, {
  state: originalState,
  dispatchTransaction(transaction) {
    const newState = view.state.apply(transaction);
    if (transaction.docChanged) {
      const _mappings = transaction.mapping.maps.map(function (step) {
        return step.ranges;
      });
      mappings.push(..._mappings);
      console.log('mappings', mappings);
    }
    view.updateState(newState);
  },
});

const BASE_OFFSET = 1;

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

  let from = startOffset + BASE_OFFSET;
  let to = endOffset + BASE_OFFSET;
  const mapping = new Mapping(
    mappings.map(function (_mapping) {
      return new StepMap(_mapping);
    }),
  );
  from = mapping.map(from);
  // -1 means select ahead
  to = mapping.map(to, -1);

  const sel = TextSelection.create(view.state.doc, from, to);
  const tr = view.state.tr;

  tr.setSelection(sel);
  const newState = view.state.apply(tr);
  view.updateState(newState);
  view.focus();
});
