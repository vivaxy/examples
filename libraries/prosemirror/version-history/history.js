/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping, ReplaceStep } from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';

export function rebaseSteps(stepsInfo, over, transform, mapDecoration) {
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

  createEditorStateByCommitId(id) {
    const commit = this.commits[id];
    const oldEditorState = commit.editorState;
    const transaction = oldEditorState.tr.setMeta('addToHistory', false);

    commit.stepsInfo.forEach(function (stepInfo) {
      transaction.step(stepInfo.step);
    });

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
        addDecoration(step.from, step.to, CHANGE_TYPES.UPDATE_STYLE, 'inline');
        continue;
      }

      // split step into two steps: delete + insert
      const insertLength =
        (step.gapTo || 0) - (step.gapFrom || 0) + step.slice.size;
      const baseDoc =
        toReplayStepsInfo.length === 1
          ? transaction.doc
          : transaction.docs[
              transaction.docs.length - toReplayStepsInfo.length + 1
            ];
      const insertSlice = baseDoc.slice(step.from, step.from + insertLength);
      const insertStep = new ReplaceStep(step.from, step.from, insertSlice);
      toReplayStepsInfo = rebaseSteps(
        toReplayStepsInfo.slice(i + 1),
        [stepInfo.inverted, insertStep],
        transaction,
        mapDecoration,
      );
      i = -1;

      stepInfo.inverted.slice.content.forEach(function (node, offset) {
        addDecoration(
          step.from + offset,
          step.from + offset + node.nodeSize,
          CHANGE_TYPES.DELETE_CONTENT,
          node.type.isInline ? 'inline' : 'node',
        );
      });
      insertSlice.content.forEach(function (content, offset) {
        addDecoration(
          insertStep.from + offset,
          insertStep.from + offset + content.nodeSize,
          CHANGE_TYPES.INSERT_CONTENT,
          content.type.isInline ? 'inline' : 'node',
        );
      });
    }

    transaction.setMeta(highlightPlugin, decorationSet);
    return oldEditorState.apply(transaction);
  }

  reset() {
    this.commits = [];
  }
}

export const history = new History();

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
  if (step0.constructor === ReplaceStep && step1.constructor === ReplaceStep) {
    if (step0.from >= step1.from && step0.from + step0.slice.size <= step1.to) {
      const merged = new ReplaceStep(
        step1.from,
        step1.to - (step0.slice.size - step0.to + step0.from),
        step1.slice,
        step1.structure,
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
  },
});

export const CHANGE_TYPES = {
  INSERT_CONTENT: 'insert-content',
  DELETE_CONTENT: 'delete-content',
  UPDATE_STYLE: 'update-style',
};
