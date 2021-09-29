/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

import {
  annotationPlugin,
  createAnnotationHandlePlugin,
  annotationPluginKey,
} from './annotations';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [
    ...exampleSetup({ schema }),
    annotationPlugin,
    createAnnotationHandlePlugin((transaction) => {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
    }),
  ],
  annotations: [
    {
      from: 12,
      to: 13,
      id: '0000-1632900931897-1795534064',
      comment: 'This is a node!',
      type: 'node',
    },
    {
      from: 2,
      to: 10,
      id: '0000-1632904224730-642213412',
      comment: 'Overlapping!',
      type: 'inline',
    },
    {
      from: 3,
      to: 5,
      id: '0000-1632900918678-1210060443',
      comment: 'c34',
      type: 'inline',
    },
    {
      from: 7,
      to: 9,
      id: '0000-1632900924387-1538760373',
      comment: 'c78',
      type: 'inline',
    },
    {
      from: 18,
      to: 20,
      id: '0000-1632900937947-1721039019',
      comment: 'c56',
      type: 'inline',
    },
  ],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

document
  .querySelector('#get-current-annotations')
  .addEventListener('click', function () {
    const annotationPluginState = annotationPluginKey.getState(
      editorView.state,
    );
    const annotations = annotationPluginState.toJSON();
    console.log('annotations', annotations);
  });

window.editorView = view;
window.annotationPlugin = annotationPlugin;
window.annotationPluginKey = annotationPluginKey;
