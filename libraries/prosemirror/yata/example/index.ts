/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import { Step } from 'prosemirror-transform';
import schema from './schema.js';
import { Document } from '../yata/index.js';

const state1 = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const doc1 = Document.fromNodes(state1.doc.content);

const view1 = new EditorView(document.querySelector('.editor[data-id="1"]'), {
  state: state1,
  dispatchTransaction(tr: Transaction) {
    view1.updateState(view1.state.apply(tr));
    if (!tr.getMeta('sync')) {
      tr.steps.forEach(function (step: Step) {
        doc1.applyStep(step);
      });
    }
  },
});

const doc2 = new Document();
doc2.applyItems(doc1.toItems(), schema);
const view2 = new EditorView(document.querySelector('.editor[data-id="2"]'), {
  state: state1,
  dispatchTransaction(tr: Transaction) {
    view2.updateState(view2.state.apply(tr));
    if (!tr.getMeta('sync')) {
      tr.steps.forEach(function (step: Step) {
        doc2.applyStep(step);
      });
    }
  },
});

document
  .querySelector('.sync[data-id="1"]')!
  .addEventListener('click', function () {
    const data1 = doc1.toItems();
    const steps = doc2.applyItems(data1, schema);
    let tr = view2.state.tr;
    for (const step of steps) {
      tr = tr.step(step);
    }
    tr = tr.setMeta('sync', true);
    view2.dispatch(tr);
    view2.focus();
    console.log('sync doc1 to doc2', steps.length, 'steps');
  });

document
  .querySelector('.sync[data-id="2"]')!
  .addEventListener('click', function () {
    const data2 = doc2.toItems();
    const steps = doc1.applyItems(data2, schema);
    let tr = view1.state.tr;
    for (const step of steps) {
      tr = tr.step(step);
    }
    tr = tr.setMeta('sync', true);
    view1.dispatch(tr);
    view1.focus();
    console.log('sync doc2 to doc1', steps.length, 'steps');
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
