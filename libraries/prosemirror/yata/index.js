/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import schema from './schema.js';
import { Document } from './yata/index.js';

const state1 = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const doc1 = Document.fromNodes(state1.doc.content);

const view1 = new EditorView(document.querySelector('.editor[data-id="1"]'), {
  state: state1,
  dispatchTransaction(tr) {
    view1.updateState(view1.state.apply(tr));
    tr.steps.forEach(function (step) {
      doc1.applyStep(step);
    });
  },
});

const state2 = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});
const doc2 = Document.fromNodes(state2.doc.content);
const view2 = new EditorView(document.querySelector('.editor[data-id="2"]'), {
  state: state2,
  dispatchTransaction(tr) {
    view2.updateState(view2.state.apply(tr));
    tr.steps.forEach(function (step) {
      doc2.applyStep(step);
    });
  },
});

document
  .querySelector('.sync[data-id="1"]')
  .addEventListener('click', function () {
    const data1 = doc1.toJSON();
  });
document
  .querySelector('.sync[data-id="2"]')
  .addEventListener('click', function () {
    const data2 = doc2.toJSON();
  });

window.view1 = view1;
window.doc1 = doc1;
window.view2 = view2;
window.doc2 = doc2;
