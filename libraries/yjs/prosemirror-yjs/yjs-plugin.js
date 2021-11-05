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
import { Plugin, PluginKey } from 'prosemirror-state';
import * as Y from 'yjs';
import { insert, remove } from './helpers';

const pluginKey = new PluginKey('yjs');

export default new Plugin({
  key: pluginKey,
  state: {
    init: (config) => {
      const { yjs } = config;
      yjs.yDoc.on('update', function (update) {
        yjs.onUpdate(update, yjs.id);
      });
      const yXmlFragment = yjs.yDoc.get('prosemirror', Y.XmlFragment);
      yXmlFragment.observeDeep(function (events, transaction) {
        debugger;
        console.log(
          events.map((event) => event.changes.delta),
          transaction,
        );
      });
      return yjs;
    },
    apply: (tr, yState, oldEditorState, newEditorState) => {
      if (!tr.docChanged) {
        return yState;
      }
      tr.steps.forEach(function (step) {
        switch (true) {
          case step instanceof ReplaceStep:
          case step instanceof ReplaceAroundStep:
            if (step.to > step.from) {
              remove(
                yState.yDoc,
                oldEditorState.schema,
                step.from,
                step.to - step.from,
              );
            }
            if (step.slice.content.size) {
              insert(yState.yDoc, step.from, step.slice);
            }
            break;
          default:
            throw new Error('Unexpect step constructor' + step.constructor);
        }
      });
      console.log(yState.yDoc.toJSON());
      return yState;
    },
  },
});
