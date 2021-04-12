/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { ReplaceStep } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

const UPDATED_SEL = 1,
  UPDATED_MARKS = 2,
  UPDATED_SCROLL = 4;

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
