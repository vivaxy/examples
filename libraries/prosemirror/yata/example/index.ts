/**
 * @since 2022-03-12
 * @author vivaxy
 */
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { exampleSetup } from 'prosemirror-example-setup';
import { undo, redo } from 'prosemirror-history';
import { Step } from 'prosemirror-transform';
import schema from './schema.js';
import { Document } from '../yata/index.js';

const state1 = EditorState.create({
  schema,
  plugins: [
    ...exampleSetup({
      schema: schema,
      history: true, // exampleSetup includes history plugin by default
    }),
  ],
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

const state2 = EditorState.create({
  schema,
  plugins: [
    ...exampleSetup({
      schema: schema,
      history: true, // exampleSetup includes history plugin by default
    }),
  ],
});

const doc2 = new Document();
doc2.applyItems(doc1.toItems(), schema);
const view2 = new EditorView(document.querySelector('.editor[data-id="2"]'), {
  state: state2,
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

// Undo/Redo button handlers for Editor 1
document
  .querySelector('.undo[data-id="1"]')!
  .addEventListener('click', function () {
    undo(view1.state, view1.dispatch);
    view1.focus();
  });

document
  .querySelector('.redo[data-id="1"]')!
  .addEventListener('click', function () {
    redo(view1.state, view1.dispatch);
    view1.focus();
  });

// Undo/Redo button handlers for Editor 2
document
  .querySelector('.undo[data-id="2"]')!
  .addEventListener('click', function () {
    undo(view2.state, view2.dispatch);
    view2.focus();
  });

document
  .querySelector('.redo[data-id="2"]')!
  .addEventListener('click', function () {
    redo(view2.state, view2.dispatch);
    view2.focus();
  });

// Expose to window for debugging
declare global {
  interface Window {
    view1: EditorView;
    doc1: Document;
    view2: EditorView;
    doc2: Document;
    undo1: () => boolean;
    redo1: () => boolean;
    undo2: () => boolean;
    redo2: () => boolean;
  }
}

window.view1 = view1;
window.doc1 = doc1;
window.view2 = view2;
window.doc2 = doc2;

// Editor-specific undo/redo functions for debugging
window.undo1 = () => undo(view1.state, view1.dispatch);
window.redo1 = () => redo(view1.state, view1.dispatch);
window.undo2 = () => undo(view2.state, view2.dispatch);
window.redo2 = () => redo(view2.state, view2.dispatch);
