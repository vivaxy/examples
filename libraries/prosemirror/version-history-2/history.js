/**
 * @since 2021-09-13
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Mapping, ReplaceStep } from 'prosemirror-transform';
import { DOMSerializer } from 'prosemirror-model';

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
    const { editorState, steps } = commit;
    let decorationSet = DecorationSet.empty;
    const tr = editorState.tr.setMeta('addToHistory', false);

    steps.forEach(function (step) {
      tr.step(step);
      decorationSet = decorationSet.map(new Mapping([step.getMap()]), tr.doc);

      if (step.structure) {
        return;
      }

      if (step.mark) {
        decorationSet = decorationSet.add(tr.doc, [
          Decoration.inline(step.from, step.to, {
            class: CHANGE_TYPES.UPDATE_STYLE,
          }),
        ]);
        return;
      }

      // handle remove
      const removedSlice = tr.docs[tr.docs.length - 1].slice(
        step.from,
        step.to,
      );
      if (removedSlice.content.size) {
        const domNode = document.createElement('span');
        domNode.classList.add(CHANGE_TYPES.DELETE_CONTENT);
        // FIXME: nodeView is not rendered correctly
        const domFragment = DOMSerializer.fromSchema(
          editorState.schema,
        ).serializeFragment(removedSlice.content);
        domNode.appendChild(domFragment);

        decorationSet = decorationSet.add(tr.doc, [
          Decoration.widget(step.from, domNode, {
            // follow nodes before
            side: -1,
          }),
        ]);
      }
      // handle insert
      const { slice } = step;
      if (slice.content.size) {
        let posOffset = step.from - slice.openStart;
        slice.content.descendants(function (node, innerPos) {
          if (node.isText) {
            decorationSet = decorationSet.add(tr.doc, [
              Decoration.inline(
                posOffset + innerPos,
                posOffset + innerPos + node.nodeSize,
                {
                  class: CHANGE_TYPES.INSERT_CONTENT,
                },
              ),
            ]);
          } else {
            decorationSet = decorationSet.add(tr.doc, [
              Decoration.node(
                posOffset + innerPos,
                posOffset + innerPos + node.nodeSize,
                {
                  class: CHANGE_TYPES.INSERT_CONTENT,
                },
              ),
            ]);
          }
          return false;
        });
      }
    });

    tr.setMeta(highlightPlugin, decorationSet);
    return editorState.apply(tr);
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
  if (
    step0.constructor === ReplaceStep &&
    step1.constructor === ReplaceStep &&
    !step0.structure &&
    !step1.structure
  ) {
    if (step0.from >= step1.from && step0.from + step0.slice.size <= step1.to) {
      return new ReplaceStep(
        step1.from,
        step1.to - (step0.slice.size - step0.to + step0.from),
        step1.slice,
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
