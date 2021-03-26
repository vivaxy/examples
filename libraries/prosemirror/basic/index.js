/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from 'https://unpkg.com/prosemirror-state?module';
import { EditorView } from 'https://unpkg.com/prosemirror-view?module';
import { Schema, DOMParser } from 'https://unpkg.com/prosemirror-model?module';
import { schema } from 'https://unpkg.com/prosemirror-schema-basic?module';
import { addListNodes } from 'https://unpkg.com/prosemirror-schema-list?module';
import { exampleSetup } from 'https://unpkg.com/prosemirror-example-setup?module';

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
