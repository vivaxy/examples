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
import { insert, remove, y2p } from './helpers';

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
          tr.steps.forEach(function (step) {
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
