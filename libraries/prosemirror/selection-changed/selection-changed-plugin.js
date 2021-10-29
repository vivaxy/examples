/**
 * @since 2021-10-29
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';

export const selectionChangedPluginKey = new PluginKey('selection-changed');

export const selectionChangedPlugin = new Plugin({
  key: selectionChangedPluginKey,
  state: {
    init(config, editorState) {
      return { selection: editorState.selection };
    },
    apply(tr, prevState, oldEditorState, newEditorState) {
      const newSelection = newEditorState.selection;
      const oldSelection = prevState.selection;

      if (!oldSelection.map(tr.doc, tr.mapping).eq(newSelection)) {
        console.log('selection changed');
      }
      return { selection: newSelection };
    },
  },
});
