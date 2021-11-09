/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: exampleSetup({ schema: mySchema }),
  }),
});

Object.keys(mySchema.nodes).forEach(function (nodeName) {
  if (mySchema.nodes[nodeName].spec.defining) {
    console.log(nodeName, 'is defining');
  }
});

window.view = view;
