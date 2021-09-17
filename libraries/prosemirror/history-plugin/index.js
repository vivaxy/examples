/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';
/**
 * 1. save undo and redo steps
 * 2. handle addToHistory: false
 * 3. handle appendTransaction
 * 4. handle rebasedSteps
 */
import { history, undo, redo } from 'prosemirror-history';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [history()],
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.undo = function () {
  undo(view.state, view.dispatch);
};

window.redo = function () {
  redo(view.state, view.dispatch);
};
