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
import yjsPlugin from './yjs-plugin';
import { y2p, p2y } from './helpers';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

function broadcast(update) {
  // TODO
}

function createEditor($container, pDoc) {
  return new EditorView($container, {
    state: EditorState.create({
      doc: pDoc,
      yjs: {
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
