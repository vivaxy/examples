/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

let state = EditorState.create({ schema });
let view = new EditorView(document.body, {
  state,
  dispatchTransaction(transaction) {
    console.log(
      'Document size went from',
      transaction.before.content.size,
      'to',
      transaction.doc.content.size,
    );
    let newState = view.state.apply(transaction);
    view.updateState(newState);
  },
});
