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
      return yjs;
    },
    apply: (tr, yState, oldEditorState, newEditorState) => {
      if (!tr.docChanged) {
        return yState;
      }
      const type = yState.yDoc.get('prosemirror', Y.XmlFragment);
      const mapping = new Map();
      tr.steps.forEach(function (step) {
        switch (true) {
          case step instanceof ReplaceStep:
          case step instanceof ReplaceAroundStep:
            if (step.to > step.from) {
              remove(yState.yDoc, step.from, step.to - step.from);
            }
            if (step.slice.content.size) {
              insert(yState.yDoc, step.from, step.slice);
            }
            break;
          default:
            throw new Error('Unexpect step constructor' + step.constructor);
        }
      });
      return yState;
    },
  },
});
