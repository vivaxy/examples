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
          return { selection: editorState.selection, focused: false };
        },
        apply(tr, prevState, oldEditorState, newEditorState) {
          const newSelection = newEditorState.selection;
          const oldSelection = prevState.selection;
          const selectionChanged = !oldSelection
            .map(tr.doc, tr.mapping)
            .eq(newSelection);
          const meta = tr.getMeta(selectionChangedPluginKey);
          const newFocused = meta ? meta.focused : prevState.focused;
          const focusChanged = prevState.focused !== newFocused;
          if (selectionChanged || focusChanged) {
            onSelectionChange(newSelection, newFocused);
          }
          return { selection: newSelection, focused: newFocused };
        },
      },
      view(editorView) {
        function handleFocusIn() {
          editorView.dispatch(
            editorView.state.tr.setMeta(selectionChangedPluginKey, {
              focused: true,
            }),
          );
        }

        function handleFocusOut() {
          editorView.dispatch(
            editorView.state.tr.setMeta(selectionChangedPluginKey, {
              focused: false,
            }),
          );
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
