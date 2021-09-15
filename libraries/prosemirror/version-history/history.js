/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping, ReplaceStep } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

class Commit {
  constructor(editorState, steps, message) {
    this.editorState = editorState;
    this.steps = steps;
    this.message = message;
  }
}

class History {
  constructor() {
    this.reset();
  }

  commit(editorState, steps, message) {
    this.commits.push(new Commit(editorState, steps, message));
  }

  createEditorStateByCommitId(id) {
    const commit = this.commits[id];
    const oldEditorState = commit.editorState;
    const transaction = oldEditorState.tr.setMeta('addToHistory', false);

    // we preserve deletions, so steps after deleteStep will rebase upon `remapping`
    const remappingForSteps = new Mapping();
    let decorationSet = DecorationSet.empty;

    function addDecoration(from, to, type, decorationType = 'inline') {
      if (from !== to) {
        decorationSet = decorationSet.add(transaction.doc, [
          Decoration[decorationType](from, to, { class: type }),
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

    commit.steps.forEach(function (step) {
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
        const invertedDeleteStep = mappedStep.invert(transaction.doc);
        addRemapping(invertedDeleteStep);
        invertedDeleteStep.slice.content.forEach(function (content, offset) {
          addDecoration(
            invertedDeleteStep.from + offset,
            invertedDeleteStep.to + offset + content.nodeSize,
            CHANGE_TYPES.DELETE,
            content.type.isInline ? 'inline' : 'node',
          );
        });
      } else if (step.from === step.to) {
        // insertion
        // map decorationSet to new positions
        transaction.step(mappedStep);
        mapDecoration(mappedStep);
        step.slice.content.forEach(function (content, offset) {
          addDecoration(
            mappedStep.from + offset,
            mappedStep.from + offset + content.nodeSize,
            CHANGE_TYPES.INSERT,
            content.type.isInline ? 'inline' : 'node',
          );
        });
      } else {
        // modify
        // retain old data, add insert new slice, both mark as modified
        // highlight original position
        const deleteStep = new ReplaceStep(
          mappedStep.from,
          mappedStep.to,
          Slice.empty,
        );
        const invertedDeleteStep = deleteStep.invert(transaction.doc);
        addRemapping(invertedDeleteStep);
        invertedDeleteStep.slice.content.forEach(function (content, offset) {
          addDecoration(
            invertedDeleteStep.from + offset,
            invertedDeleteStep.to + offset + content.nodeSize,
            CHANGE_TYPES.MODIFY_DELETE,
            content.type.isInline ? 'inline' : 'node',
          );
        });
        // highlight new content
        const stepResult = mappedStep.apply(transaction.doc);
        const newSlice = stepResult.doc.slice(
          mappedStep.from,
          mappedStep.from +
            (mappedStep.gapTo || 0) -
            (mappedStep.gapFrom || 0) +
            mappedStep.slice.size,
        );
        const insertStep = new ReplaceStep(
          invertedDeleteStep.to + invertedDeleteStep.slice.size,
          invertedDeleteStep.to + invertedDeleteStep.slice.size,
          newSlice,
        );
        transaction.step(insertStep);
        mapDecoration(insertStep);
        newSlice.content.forEach(function (content, offset) {
          addDecoration(
            insertStep.from + offset,
            insertStep.from + offset + content.nodeSize,
            CHANGE_TYPES.MODIFY_INSERT,
            content.type.isInline ? 'inline' : 'node',
          );
        });
      }
    });

    transaction.setMeta(highlightPlugin, decorationSet);
    return oldEditorState.apply(transaction);
  }

  reset() {
    this.commits = [];
  }
}

export const history = new History();

function mergeStep(step0, step1) {
  const merged = step0.merge(step1);
  if (merged) {
    return merged;
  }
  // ignore middle steps
  if (step0.constructor === ReplaceStep && step1.constructor === ReplaceStep) {
    if (step0.from >= step1.from && step0.from + step0.slice.size <= step1.to) {
      return new ReplaceStep(
        step1.from,
        step1.to - (step0.slice.size - step0.to + step0.from),
        step1.slice,
        step1.structure,
      );
    }
  }
  return null;
}

function mergeSteps(steps) {
  const res = [];
  steps.forEach(function (step) {
    if (!res.length) {
      res.push(step);
    } else {
      const lastStep = res[res.length - 1];
      const mergedStep = mergeStep(lastStep, step);
      if (mergedStep) {
        res[res.length - 1] = mergedStep;
      } else {
        res.push(step);
      }
    }
  });
  return res;
}

export const trackPlugin = new Plugin({
  key: new PluginKey('track'),
  state: {
    init(_, editorState) {
      return { editorState, uncommittedSteps: [] };
    },
    apply(transaction, prevState, oldEditorState) {
      // track changes
      if (transaction.docChanged) {
        return {
          ...prevState,
          uncommittedSteps: mergeSteps([
            ...prevState.uncommittedSteps,
            ...transaction.steps,
          ]),
        };
      }
      // commit
      const commitMessage = transaction.getMeta(this);
      if (commitMessage) {
        history.commit(
          prevState.editorState,
          prevState.uncommittedSteps,
          commitMessage,
        );
        return {
          editorState: oldEditorState,
          uncommittedSteps: [],
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
    apply(transaction, prevState) {
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
