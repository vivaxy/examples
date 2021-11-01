/**
 * @since 2021-10-29
 * @author vivaxy
 */
import { Plugin, PluginKey } from 'prosemirror-state';

export const selectionChangedPluginKey = new PluginKey('selection-changed');

export class SelectionChangedPlugin {
  constructor(onSelectionChange) {
    return new Plugin({
      key: selectionChangedPluginKey,
      state: {
        init(config, editorState) {
          return { selection: editorState.selection };
        },
        apply(tr, prevState, oldEditorState, newEditorState) {
          const newSelection = newEditorState.selection;
          const oldSelection = prevState.selection;
          if (!oldSelection.map(tr.doc, tr.mapping).eq(newSelection)) {
            onSelectionChange(newSelection, true);
          }
          return { selection: newSelection };
        },
      },
      view(editorView) {
        function handleFocusIn() {
          const selection = selectionChangedPluginKey.getState(editorView.state)
            .selection;
          onSelectionChange(selection, true);
        }

        function handleFocusOut() {
          const selection = selectionChangedPluginKey.getState(editorView.state)
            .selection;
          onSelectionChange(selection, false);
        }

        editorView.dom.addEventListener('focusin', handleFocusIn);
        editorView.dom.addEventListener('focusout', handleFocusOut);

        return {
          destroy() {
            editorView.dom.removeEventListener('focusin', handleFocusIn);
            editorView.dom.removeEventListener('focusout', handleFocusOut);
          },
        };
      },
    });
  }
}
