/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from '../_snowpack/pkg/prosemirror-state.js';
import { EditorView } from '../_snowpack/pkg/prosemirror-view.js';
import { Schema, DOMParser } from '../_snowpack/pkg/prosemirror-model.js';
import { schema } from '../_snowpack/pkg/prosemirror-schema-basic.js';
import { addListNodes } from '../_snowpack/pkg/prosemirror-schema-list.js';
import { exampleSetup } from '../_snowpack/pkg/prosemirror-example-setup.js';

// Mix the nodes from prosemirror-schema-list into the basic schema to
// create a schema with list support.
const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

window.view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: exampleSetup({ schema: mySchema }),
  }),
});
