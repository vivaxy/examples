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
  dispatchTransaction(tr) {
    console.log('tr.selectionSet', tr.selectionSet);
    console.log('tr.storedMarks', tr.storedMarks);
    console.log('tr.storedMarksSet', tr.storedMarksSet);
    console.log('tr.meta', tr.meta);

    const newState = view.state.apply(tr);
    window.view.updateState(newState);
  },
});
