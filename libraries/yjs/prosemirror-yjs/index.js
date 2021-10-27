/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { updateYFragment } from 'y-prosemirror/src/plugins/sync-plugin';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import yjsPlugin from './yjs-plugin';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

function createEditor($container, pDoc) {
  const mapping = new Map();

  function p2y(pDoc) {
    const yDoc = new Y.Doc();
    const type = yDoc.get('prosemirror', Y.XmlFragment);
    if (!type.doc) {
      return yDoc;
    }

    updateYFragment(type.doc, type, pDoc, mapping);
    return type.doc;
  }

  return new EditorView($container, {
    state: EditorState.create({
      doc: pDoc,
      yjs: {
        yDoc: p2y(pDoc),
        mapping,
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
