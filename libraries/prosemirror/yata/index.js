/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import schema from './schema.js';

const state = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.view = view;
