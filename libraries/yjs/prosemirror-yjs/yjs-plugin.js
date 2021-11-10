/**
 * @since 2021-10-27
 * @author vivaxy
 */
import {
  ReplaceStep,
  AddMarkStep,
  RemoveMarkStep,
  ReplaceAroundStep,
} from 'prosemirror-transform';
import { Slice } from 'prosemirror-model';
import { Plugin, PluginKey } from 'prosemirror-state';
import * as Y from 'yjs';
import { insert, remove, format, y2p } from './helpers';

const pluginKey = new PluginKey('yjs');

export default new Plugin({
  key: pluginKey,
  state: {
    init: (config) => {
      const { yjs } = config;
      yjs.xmlFragment.doc.on('update', function (update, origin) {
        if (origin === 'local') {
          yjs.onLocalUpdate(update, yjs.id);
        }
      });
      // doc.get returns new type
      yjs.xmlFragment.observeDeep(function (events, transaction) {
        console.log(
          'observeDeep',
          yjs.xmlFragment.doc.clientID,
          transaction.origin,
        );
        if (transaction.origin === 'remote') {
          const view = yjs.getView();
          const pDoc = y2p(yjs.xmlFragment, view.state.schema);
          view.dispatch(
            view.state.tr
              .setMeta(pluginKey, { origin: 'remote' })
              .replace(
                0,
                view.state.doc.content.size,
                new Slice(pDoc.content, 0, 0),
              ),
          );
        }
      });
      return yjs;
    },
    apply: (tr, yState, oldEditorState, newEditorState) => {
      if (!tr.docChanged) {
        return yState;
      }
      const meta = tr.getMeta(pluginKey);
      if (meta && meta.origin === 'remote') {
        return yState;
      }
      Y.transact(
        yState.xmlFragment.doc,
        function () {
          tr.steps.forEach(function (rawStep) {
            const step = normalizeStep(rawStep);
            if (
              step.structure &&
              step.slice.content.content.reduce(
                (text, n) => text + n.textContent,
                '',
              ).length !== 0
            ) {
              debugger;
            }
            switch (true) {
              case step instanceof ReplaceStep:
                if (step.to > step.from) {
                  remove(
                    yState.xmlFragment,
                    oldEditorState.schema,
                    step.from,
                    step.to - step.from,
                  );
                }
                if (step.slice.content.size) {
                  insert(
                    yState.xmlFragment,
                    oldEditorState.schema,
                    step.from,
                    step.slice,
                  );
                }
                break;
              case step instanceof ReplaceAroundStep:
                // TODO:
                break;
              case step instanceof AddMarkStep:
                format(
                  yState.xmlFragment,
                  oldEditorState.schema,
                  step.from,
                  step.to,
                  { [step.mark.type.name]: step.mark.attrs },
                );
                break;
              case step instanceof RemoveMarkStep:
                format(
                  yState.xmlFragment,
                  oldEditorState.schema,
                  step.from,
                  step.to,
                  { [step.mark.type.name]: null },
                );
                break;
              default:
                throw new Error('Unexpect step constructor' + step.constructor);
            }
          });
        },
        'local',
      );
      console.log(yState.xmlFragment.toJSON());
      return yState;
    },
  },
});

function normalizeStep(step) {
  /**
   * TODO:
   *  1. normalize step from structured to unstructured
   *  2. normalize step from with openStart and openEnd to unstructured
   *  3. normalize step from ReplaceAround to insert and delete
   */
  return step;
}
