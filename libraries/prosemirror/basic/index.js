/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import { Schema, DOMParser } from 'https://cdn.skypack.dev/prosemirror-model';
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { addListNodes } from 'https://cdn.skypack.dev/prosemirror-schema-list';
import { exampleSetup } from 'https://cdn.skypack.dev/prosemirror-example-setup';

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
