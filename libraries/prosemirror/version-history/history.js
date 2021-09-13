/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

class Commit {
  constructor(editorState, transactions, message) {
    this.editorState = editorState;
    this.transactions = transactions;
    this.message = message;
  }
}

export const trackPlugin = new Plugin({
  key: new PluginKey('track'),
  state: {
    init(_, editorState) {
      return { editorState, commits: [], uncommittedTransactions: [] };
    },
    apply(transaction, prevState, oldEditorState, newEditorState) {
      // track changes
      if (transaction.docChanged) {
        return {
          ...prevState,
          uncommittedTransactions: [
            ...prevState.uncommittedTransactions,
            transaction,
          ],
        };
      }
      // commit
      const commitMessage = transaction.getMeta(this);
      if (commitMessage) {
        return {
          editorState: oldEditorState,
          commits: [
            ...prevState.commits,
            new Commit(
              prevState.editorState,
              prevState.uncommittedTransactions,
              commitMessage,
            ),
          ],
          uncommittedTransactions: [],
        };
      }
      // default
      return prevState;
    },
  },
});

export const highlightPlugin = new Plugin({
  state: {
    init() {
      return { decorationSet: DecorationSet.empty };
    },
    apply(transaction, prevState, oldEditorState, newEditorState) {
      const decorations = transaction.getMeta(this);
      if (decorations) {
        const decorationSet = DecorationSet.create(
          newEditorState.doc,
          decorations.map(function (decoration) {
            return Decoration.inline(decoration.from, decoration.to, {
              class: decoration.type,
            });
          }),
        );
        return { decorationSet };
      }
      if (transaction.docChanged) {
        return {
          decorationSet: prevState.decorationSet.map(
            transaction.mapping,
            transaction.doc,
          ),
        };
      }
      return prevState;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state).decorationSet;
    },
  },
});

export const CHANGE_TYPES = {
  INSERT: 'insert',
  DELETE: 'delete',
  MODIFY: 'modify',
};
