/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import schema from './schema.js';
import { Document } from './yata/index.js';

const state = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const doc = Document.fromNodes(state.doc.content);

const view = new EditorView(document.querySelector('#editor'), {
  state,
  dispatchTransaction(tr) {
    view.updateState(view.state.apply(tr));
    tr.steps.forEach(function (step) {
      doc.applyStep(step);
    });
  },
});

window.view = view;
window.doc = doc;
