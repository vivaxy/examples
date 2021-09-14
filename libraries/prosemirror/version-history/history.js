/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping, ReplaceStep } from 'prosemirror-transform';
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

    // we preserve deletions, so steps after deleteStep will rebase upon `remapping`
    const remappingForSteps = new Mapping();
    let decorationSet = DecorationSet.empty;

    function addDecoration(from, to, type) {
      if (from !== to) {
        decorationSet = decorationSet.add(transaction.doc, [
          Decoration.inline(from, to, { class: type }),
        ]);
      }
    }

    /**
     * this happens as long as the doc changed
     * @param step
     */
    function mapDecoration(step) {
      decorationSet = decorationSet.map(
        new Mapping([step.getMap()]),
        transaction.doc,
      );
    }

    /**
     * this happens as long as the change is not original (not from the user)
     * @param step
     */
    function addRemapping(step) {
      remappingForSteps.appendMap(step.getMap(), null);
    }

    commit.transactions.forEach(function (tr) {
      tr.steps.forEach(function (step, i) {
        const mappedStep = step.map(remappingForSteps);

        if (step.mark) {
          // AddMarkStep or RemoveMarkStep
          // treat as ReplaceStep
          // mark old slice as modify delete
          addDecoration(
            mappedStep.from,
            mappedStep.to,
            CHANGE_TYPES.MODIFY_DELETE,
          );

          // insert new Slice
          const stepResult = mappedStep.apply(transaction.doc);
          const newSlice = stepResult.doc.slice(mappedStep.from, mappedStep.to);

          const insertStep = new ReplaceStep(
            mappedStep.to,
            mappedStep.to,
            newSlice,
          );
          // this is a new action, we need to save it to remapping
          addRemapping(insertStep);
          transaction.step(insertStep);
          // update existing decorationSet
          mapDecoration(insertStep);
          addDecoration(
            mappedStep.to,
            mappedStep.to + newSlice.size,
            CHANGE_TYPES.MODIFY_INSERT,
          );
        } else if (step.slice === Slice.empty) {
          const invertedDeleteStep = mappedStep.invert(tr.docs[i]);
          addRemapping(invertedDeleteStep);
          addDecoration(
            invertedDeleteStep.from,
            invertedDeleteStep.to + invertedDeleteStep.slice.size,
            CHANGE_TYPES.DELETE,
          );
        } else if (step.from === step.to) {
          // insertion
          // map decorationSet to new positions
          transaction.step(mappedStep);
          mapDecoration(mappedStep);
          addDecoration(
            mappedStep.from,
            mappedStep.to + mappedStep.slice.size,
            CHANGE_TYPES.INSERT,
          );
        } else {
          // modify
          // ReplaceAroundStep
          // retain old data, add insert new slice, both mark as modified
          // highlight original position
          const deleteStep = new ReplaceStep(
            mappedStep.from,
            mappedStep.to,
            Slice.empty,
          );
          const invertedDeleteStep = deleteStep.invert(transaction.doc);
          addRemapping(invertedDeleteStep);
          addDecoration(
            invertedDeleteStep.from,
            invertedDeleteStep.to + invertedDeleteStep.slice.size,
            CHANGE_TYPES.MODIFY_DELETE,
          );

          // highlight new content
          const insertStep = new ReplaceStep(
            invertedDeleteStep.to + invertedDeleteStep.slice.size,
            invertedDeleteStep.to + invertedDeleteStep.slice.size,
            step.slice,
            step.structure,
          );
          transaction.step(insertStep);
          mapDecoration(insertStep);
          addDecoration(
            insertStep.from,
            insertStep.to + insertStep.slice.size,
            CHANGE_TYPES.MODIFY_INSERT,
          );
        }
      });
    });

    transaction.setMeta(highlightPlugin, decorationSet);
    return oldEditorState.apply(transaction);
  }

  reset() {
    this.commits = [];
  }
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
      const decorationSet = transaction.getMeta(this);
      if (decorationSet) {
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
  MODIFY_INSERT: 'modify-insert',
  MODIFY_DELETE: 'modify-delete',
};
