/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ReplaceStep, Transform } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

const UPDATED_SEL = 1;

const state = EditorState.create({ schema });
const view = new EditorView(document.getElementById('editor'), {
  state,
  dispatchTransaction(transaction) {
    if ((transaction.updated & UPDATED_SEL) > 0) {
      console.log('Update Selection');
    }
    if (transaction.before.content.size !== transaction.doc.content.size) {
      console.log(
        'Document size went from',
        transaction.before.content.size,
        'to',
        transaction.doc.content.size,
      );
    }
    let newState = view.state.apply(transaction);
    view.updateState(newState);
  },
});

document.querySelector('#replace').addEventListener('click', function () {
  const doc = view.state.doc.toString();
  console.log('doc', doc);
  const step = new ReplaceStep(3, 5, Slice.empty);
  const result = step.apply(view.state.doc);
  if (result.failed) {
    console.log('failed', result.failed);
  } else {
    console.log(result.doc.toString());
  }
});

document.querySelector('#transform').addEventListener('click', function () {
  try {
    const tr = new Transform(view.state.doc);
    tr.delete(5, 7); // Delete between position 5 and 7
    tr.split(5); // Split the parent node at position 5
    console.log(tr.doc.toString()); // The modified document
    console.log(tr.steps.length);
  } catch (e) {
    console.error(e);
  }
});
