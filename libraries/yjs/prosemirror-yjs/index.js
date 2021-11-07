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
import { p2y } from './helpers';
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
      const { xmlFragment } = yjsPlugin.getState(view.state);
      console.log('broadcast to', xmlFragment.doc.clientID);
      Y.applyUpdate(xmlFragment.doc, update, 'remote');
    });
  }, 300);
}

function createEditor($container, initialUpdate) {
  const yDoc = new Y.Doc();
  yDoc.clientID = Number($container.id.split('-')[1]);
  Y.applyUpdate(yDoc, initialUpdate);
  const xmlFragment = yDoc.get('prosemirror', Y.XmlFragment);
  const view = new EditorView($container, {
    state: EditorState.create({
      doc: pDoc,
      yjs: {
        id: $container.id,
        xmlFragment,
        onLocalUpdate: broadcast,
        getView() {
          return view;
        },
      },
      plugins: [...exampleSetup({ schema: mySchema }), yjsPlugin],
    }),
  });
  return view;
}

const pDoc = DOMParser.fromSchema(mySchema).parse(
  document.querySelector('#content'),
);

const yDoc = new Y.Doc();
const xmlFragment = yDoc.get('prosemirror', Y.XmlFragment);
p2y(pDoc, xmlFragment);
const initialUpdate = Y.encodeStateAsUpdate(yDoc);

window.views = [
  createEditor(document.getElementById('editor-1'), initialUpdate),
  createEditor(document.getElementById('editor-2'), initialUpdate),
];
