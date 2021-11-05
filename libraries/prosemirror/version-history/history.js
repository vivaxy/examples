/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping, ReplaceStep, Transform } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

export function rebaseStepsWithoutApply(
  stepsInfo,
  over,
  transform,
  mapDecoration,
) {
  over.forEach(function (step) {
    if (step.from === step.to && step.slice.size === 0) {
      return;
    }
    transform.step(step);
    mapDecoration(step);
  });

  const tr = new Transform(transform.doc);
  const result = [];
  const mapping = transform.mapping.slice(transform.steps.length - over.length);
  stepsInfo.forEach(function (stepInfo) {
    const mapped = stepInfo.step.map(mapping);
    // maybeStep is needed to calculate accurate steps
    if (mapped && !tr.maybeStep(mapped).failed) {
      const doc = tr.docs[tr.docs.length - 1];
      result.push({
        step: mapped,
        inverted: mapped.invert(doc),
        doc,
      });
    } else {
      throw new Error('rebase failed');
    }
  });
  return result;
}

export function rebaseStepsWithApply(
  stepsInfo,
  over,
  transform,
  mapDecoration,
  addDecorations,
) {
  for (let i = stepsInfo.length - 1; i >= 0; i--) {
    transform.step(stepsInfo[i].inverted);
    mapDecoration(stepsInfo[i].inverted);
  }

  over.forEach(function (step) {
    if (step.from === step.to && step.slice.size === 0) {
      return;
    }
    transform.step(step);
    mapDecoration(step);
  });

  addDecorations();

  const result = [];

  // before insertStep
  let mapFrom = transform.steps.length - over.length;
  stepsInfo.forEach(function (stepInfo) {
    const mapped = stepInfo.step.map(transform.mapping.slice(mapFrom));
    mapFrom--;

    // maybeStep is needed to calculate accurate steps
    if (mapped && !transform.maybeStep(mapped).failed) {
      mapDecoration(mapped);
      transform.mapping.setMirror(mapFrom, transform.steps.length - 1);
      const doc = transform.docs[transform.docs.length - 1];
      result.push({
        step: mapped,
        inverted: mapped.invert(doc),
        doc,
      });
    } else {
      throw new Error('rebase failed');
    }
  });

  return result;
}

class Commit {
  constructor(editorState, stepsInfo, message) {
    this.editorState = editorState;
    this.stepsInfo = stepsInfo;
    this.message = message;
  }
}

class History {
  constructor() {
    this.reset();
  }

  commit(editorState, stepsInfo, message) {
    this.commits.push(new Commit(editorState, stepsInfo, message));
  }

  createEditorStateByCommitIdWithoutApply(id) {
    const commit = this.commits[id];
    const oldEditorState = commit.editorState;
    const transaction = oldEditorState.tr.setMeta('addToHistory', false);

    let decorationSet = DecorationSet.empty;

    function addDecoration(from, to, type, decorationType) {
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
      if (step.from === step.to && step.slice.size === 0) {
        return;
      }
      decorationSet = decorationSet.map(
        new Mapping([step.getMap()]),
        transaction.doc,
      );
    }

    for (
      let i = 0, toReplayStepsInfo = commit.stepsInfo;
      i < toReplayStepsInfo.length;
      i++
    ) {
      const stepInfo = toReplayStepsInfo[i];
      const step = stepInfo.step;

      if (step.structure && step.slice === Slice.empty) {
        continue;
      }

      if (step.mark) {
        transaction.step(step);
        addDecoration(step.from, step.to, CHANGE_TYPES.UPDATE_STYLE, 'inline');
        continue;
      }

      // split step into two steps: delete + insert
      const insertLength =
        (step.gapTo || 0) - (step.gapFrom || 0) + step.slice.size;
      const deletedSlice = transaction.doc.slice(step.from, step.to);
      const insertDeleteStep = new ReplaceStep(
        step.from,
        step.from,
        deletedSlice,
      );
      transaction.step(step);
      const insertSlice = transaction.doc.slice(
        step.from,
        step.from + insertLength,
      );
      const insertStep = new ReplaceStep(step.from, step.from, insertSlice);
      /**
       * rebaseSteps(..., [stepInfo.inverted, insertStep], ...)
       * will cause rebase fail when a step insert content within previous insertion.
       */
      toReplayStepsInfo = rebaseStepsWithoutApply(
        toReplayStepsInfo.slice(i + 1),
        [insertDeleteStep],
        transaction,
        mapDecoration,
      );
      i = -1;

      deletedSlice.content.forEach(function (node, offset) {
        addDecoration(
          step.from + offset,
          step.from + offset + node.nodeSize,
          CHANGE_TYPES.DELETE_CONTENT,
          node.type.isInline ? 'inline' : 'node',
        );
      });
      insertSlice.content.forEach(function (content, offset) {
        addDecoration(
          step.to + offset,
          step.to + offset + content.nodeSize,
          CHANGE_TYPES.INSERT_CONTENT,
          content.type.isInline ? 'inline' : 'node',
        );
      });
    }

    transaction.setMeta(highlightPlugin, decorationSet);
    return oldEditorState.apply(transaction);
  }

  createEditorStateByCommitIdWithApply(id) {
    const commit = this.commits[id];
    const oldEditorState = commit.editorState;
    const transaction = oldEditorState.tr.setMeta('addToHistory', false);

    let decorationSet = DecorationSet.empty;

    function addDecoration(from, to, type, decorationType) {
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
      if (step.from === step.to && step.slice.size === 0) {
        return;
      }
      decorationSet = decorationSet.map(
        new Mapping([step.getMap()]),
        transaction.doc,
      );
    }

    commit.stepsInfo.forEach(function (stepInfo) {
      transaction.step(stepInfo.step);
    });

    for (
      let i = 0, toReplayStepsInfo = commit.stepsInfo;
      i < toReplayStepsInfo.length;
      i++
    ) {
      const stepInfo = toReplayStepsInfo[i];
      const step = stepInfo.step;

      if (step.structure && step.slice === Slice.empty) {
        continue;
      }

      if (step.mark) {
        addDecoration(step.from, step.to, CHANGE_TYPES.UPDATE_STYLE, 'inline');
        continue;
      }

      // split step into two steps: delete + insert
      const insertLength =
        (step.gapTo || 0) - (step.gapFrom || 0) + step.slice.size;
      const docBeforeStep =
        transaction.docs[transaction.docs.length - toReplayStepsInfo.length];
      const deletedSlice = docBeforeStep.slice(step.from, step.to);
      const insertDeleteStep = new ReplaceStep(
        step.from,
        step.from,
        deletedSlice,
      );
      const docAfterStep = step.apply(docBeforeStep).doc;
      const insertSlice = docAfterStep.slice(
        step.from,
        step.from + insertLength,
      );
      const insertStep = new ReplaceStep(
        step.from + insertLength,
        step.from + insertLength,
        insertSlice,
      );
      /**
       * rebaseSteps(..., [stepInfo.inverted, insertStep], ...)
       * will cause rebase fail when a step insert content within previous insertion.
       */
      toReplayStepsInfo = rebaseStepsWithApply(
        toReplayStepsInfo.slice(i + 1),
        [insertDeleteStep],
        transaction,
        mapDecoration,
        function () {
          deletedSlice.content.forEach(function (node, offset) {
            addDecoration(
              step.from + offset,
              step.from + offset + node.nodeSize,
              CHANGE_TYPES.DELETE_CONTENT,
              node.type.isInline ? 'inline' : 'node',
            );
          });
          insertSlice.content.forEach(function (content, offset) {
            addDecoration(
              step.to + offset,
              step.to + offset + content.nodeSize,
              CHANGE_TYPES.INSERT_CONTENT,
              content.type.isInline ? 'inline' : 'node',
            );
          });
        },
      );
      i = -1;
    }

    transaction.setMeta(highlightPlugin, decorationSet);
    return oldEditorState.apply(transaction);
  }

  reset() {
    this.commits = [];
  }
}

export const history = new History();
history.createEditorStateByCommitId = history.createEditorStateByCommitIdWithApply.bind(
  history,
);

function mergeStep(stepInfo0, stepInfo1) {
  const step0 = stepInfo0.step;
  const step1 = stepInfo1.step;
  const merged = step0.merge(step1);
  if (merged) {
    return {
      step: merged,
      inverted: merged.invert(stepInfo0.doc),
      doc: stepInfo0.doc,
    };
  }
  // ignore middle steps
  if (
    step0.constructor === ReplaceStep &&
    step1.constructor === ReplaceStep &&
    !step0.structure &&
    !step1.structure
  ) {
    if (step0.from >= step1.from && step0.from + step0.slice.size <= step1.to) {
      const merged = new ReplaceStep(
        step1.from,
        step1.to - (step0.slice.size - step0.to + step0.from),
        step1.slice,
      );
      return {
        step: merged,
        inverted: merged.invert(stepInfo0.doc),
        doc: stepInfo0.doc,
      };
    }
  }
  return null;
}

function mergeStepsInfo(stepsInfo) {
  const res = [];
  stepsInfo.forEach(function (stepInfo) {
    if (!res.length) {
      res.push(stepInfo);
    } else {
      const lastStepInfo = res[res.length - 1];
      const mergedStepInfo = mergeStep(lastStepInfo, stepInfo);
      if (mergedStepInfo) {
        res[res.length - 1] = mergedStepInfo;
      } else {
        res.push(stepInfo);
      }
    }
  });
  return res;
}

export const trackPlugin = new Plugin({
  key: new PluginKey('track'),
  state: {
    init(_, editorState) {
      return { editorState, uncommittedStepsInfo: [] };
    },
    apply(transaction, prevState, oldEditorState) {
      // track changes
      if (transaction.docChanged) {
        return {
          ...prevState,
          uncommittedStepsInfo: mergeStepsInfo([
            ...prevState.uncommittedStepsInfo,
            ...transaction.steps.map(function (step, i) {
              return {
                step,
                inverted: step.invert(transaction.docs[i]),
                doc: transaction.docs[i],
              };
            }),
          ]),
        };
      }
      // commit
      const commitMessage = transaction.getMeta(this);
      if (commitMessage) {
        history.commit(
          prevState.editorState,
          prevState.uncommittedStepsInfo,
          commitMessage,
        );
        return {
          editorState: oldEditorState,
          uncommittedStepsInfo: [],
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
    editable(state) {
      return this.getState(state).decorationSet.find().length === 0;
    },
  },
});

export const CHANGE_TYPES = {
  INSERT_CONTENT: 'insert-content',
  DELETE_CONTENT: 'delete-content',
  UPDATE_STYLE: 'update-style',
};
