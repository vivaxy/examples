/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import { Step } from 'prosemirror-transform';
import schema from './schema.js';
import { Document } from './yata/index.js';

const state1 = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const doc1 = Document.fromNodes(state1.doc.content);

const view1 = new EditorView(document.querySelector('.editor[data-id="1"]'), {
  state: state1,
  dispatchTransaction(tr: Transaction) {
    view1.updateState(view1.state.apply(tr));
    tr.steps.forEach(function (step: Step) {
      doc1.applyStep(step);
    });
  },
});

const doc2 = new Document(doc1.client);
doc2.applyItems(doc1.toItems());
const view2 = new EditorView(document.querySelector('.editor[data-id="2"]'), {
  state: state1,
  dispatchTransaction(tr: Transaction) {
    view2.updateState(view2.state.apply(tr));
    tr.steps.forEach(function (step: Step) {
      doc2.applyStep(step);
    });
  },
});

document
  .querySelector('.sync[data-id="1"]')!
  .addEventListener('click', function () {
    const data1 = doc1.toItems();
    doc2.applyItems(data1);
    const tr = view2.state.tr.replaceWith(
      0,
      view2.state.doc.content.size,
      doc2.toProseMirrorDoc(view2.state.schema).content,
    );
    view2.dispatch(tr);
    view2.focus();
    console.log('sync doc1 to doc2');
  });

document
  .querySelector('.sync[data-id="2"]')!
  .addEventListener('click', function () {
    const data2 = doc2.toItems();
    doc1.applyItems(data2);
    const tr = view1.state.tr.replaceWith(
      0,
      view1.state.doc.content.size,
      doc1.toProseMirrorDoc(view1.state.schema).content,
    );
    view1.dispatch(tr);
    view1.focus();
    console.log('sync doc2 to doc1');
  });

// Expose to window for debugging
declare global {
  interface Window {
    view1: EditorView;
    doc1: Document;
    view2: EditorView;
    doc2: Document;
  }
}

window.view1 = view1;
window.doc1 = doc1;
window.view2 = view2;
window.doc2 = doc2;
