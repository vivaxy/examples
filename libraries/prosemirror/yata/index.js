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

const doc2 = new Document(doc1.client);
doc2.applyItems(doc1.toItems());
const view2 = new EditorView(document.querySelector('.editor[data-id="2"]'), {
  state: state1,
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
    const data1 = doc1.toItems();
    doc2.applyItems(data1);
    // todo doc to prosemirror doc
    const tr = view2.state.tr.replaceWith(
      0,
      view2.state.doc.content.size,
      view2.state.schema.nodeFromJSON(data1),
    );
    view2.dispatch(tr);
    view2.focus();
    console.log('sync doc1 to doc2');
  });

document
  .querySelector('.sync[data-id="2"]')
  .addEventListener('click', function () {
    const data2 = doc2.toItems();
  });

window.view1 = view1;
window.doc1 = doc1;
window.view2 = view2;
window.doc2 = doc2;
