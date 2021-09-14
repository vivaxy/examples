/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

class Commit {
  constructor(editorState, transactions, message) {
    this.editorState = editorState;
    this.transactions = transactions;
    this.message = message;
  }
}

class History {
  constructor() {
    this.reset();
  }

  commit(editorState, transactions, message) {
    this.commits.push(new Commit(editorState, transactions, message));
  }

  createEditorStateByCommitId(id) {
    const commit = this.commits[id];
    const oldEditorState = commit.editorState;
    const transaction = oldEditorState.tr.setMeta('addToHistory', false);
    const decorations = computeDecorations(
      transaction,
      oldEditorState,
      commit.transactions,
    );
    transaction.setMeta(highlightPlugin, decorations);
    return oldEditorState.apply(transaction);
  }

  reset() {
    this.commits = [];
  }
}

export function computeDecorations(transaction, oldEditorState, transactions) {
  // we preserve deletions, so steps after deleteStep will rebase upon `remapping`
  const remapping = new Mapping();
  const decorations = [];
  transactions.forEach(function (tr) {
    tr.steps.forEach(function (step, i) {
      if (step.slice === Slice.empty) {
        // deletion
        const insertStep = step.invert(tr.docs[i]).map(remapping);
        remapping.appendMap(insertStep.map(remapping).getMap(), null);
        decorations.push({
          from: insertStep.from,
          to: insertStep.to + insertStep.slice.size,
          type: CHANGE_TYPES.DELETE,
        });
      } else if (step.from === step.to) {
        // insertion
        const insertStep = step.map(remapping);
        transaction.step(insertStep);
        decorations.push({
          from: insertStep.from,
          to: insertStep.to + insertStep.slice.size,
          type: CHANGE_TYPES.INSERT,
        });
        // be careful to AddMarkStep/RemoveMarkStep
      } else {
        // modify
        const insertStep = step.map(remapping);
        // retain old data, add insert new slice, both mark as modified
        // be careful to ReplaceAroundStep
      }
    });
  });
  return decorations;
}

export const history = new History();

export const trackPlugin = new Plugin({
  key: new PluginKey('track'),
  state: {
    init(_, editorState) {
      return { editorState, uncommittedTransactions: [] };
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
        history.commit(
          prevState.editorState,
          prevState.uncommittedTransactions,
          commitMessage,
        );
        return {
          editorState: oldEditorState,
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
