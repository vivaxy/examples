/**
 * @since 2021-06-24
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import * as Y from 'yjs';
import yjsPlugin from './yjs-plugin';
import { y2p, p2y } from './helpers';
import updateDecoder from '../data-visualization/src/update-decoder';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

function broadcast(update, sourceId) {
  const otherViews = window.views.filter(function (view) {
    return yjsPlugin.getState(view.state).id !== sourceId;
  });
  console.log('update', updateDecoder(update));
  setTimeout(function () {
    otherViews.forEach(function (view) {
      Y.applyUpdate(yjsPlugin.getState(view.state).yDoc, update);
    });
  }, 1000);
}

function createEditor($container, pDoc) {
  return new EditorView($container, {
    state: EditorState.create({
      doc: pDoc,
      yjs: {
        id: $container.id,
        yDoc: p2y(pDoc),
        onUpdate: broadcast,
      },
      plugins: [...exampleSetup({ schema: mySchema }), yjsPlugin],
    }),
  });
}

const pDoc = DOMParser.fromSchema(mySchema).parse(
  document.querySelector('#content'),
);

window.views = [
  createEditor(document.getElementById('editor-1'), pDoc),
  createEditor(document.getElementById('editor-2'), pDoc),
];
