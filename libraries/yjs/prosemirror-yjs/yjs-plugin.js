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
import {
  relativePositionToAbsolutePosition,
  absolutePositionToRelativePosition,
} from 'y-prosemirror';
import * as Y from 'yjs';
import { getRelativePosition } from './y-prosemirror-helpers';

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
              const _relFrom = absolutePositionToRelativePosition(
                step.from,
                type,
                yState.mapping,
              );
              const relFrom = getRelativePosition(_relFrom);
              relFrom.type.delete();
            }

            const relTo = absolutePositionToRelativePosition(
              step.to,
              type,
              yState.mapping,
            );
            break;
          default:
            throw new Error('Unexpect step constructor' + step.constructor);
        }
      });
      return yState;
    },
  },
});
