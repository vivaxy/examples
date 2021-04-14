/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';

const state = EditorState.create({ schema });
const view = new EditorView(document.getElementById('editor'), {
  state,
});
