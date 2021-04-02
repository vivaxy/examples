/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

const UPDATED_SEL = 1,
  UPDATED_MARKS = 2,
  UPDATED_SCROLL = 4;

let state = EditorState.create({ schema });
let view = new EditorView(document.getElementById('editor'), {
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
