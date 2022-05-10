/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';

const schema = new Schema({
  nodes: basicSchema.spec.nodes,
  marks: {
    ...basicSchema.spec.marks,
    em: {
      ...basicSchema.marks.em.spec,
      inclusive: false,
    },
  },
});

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: exampleSetup({ schema }),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
  dispatchTransaction(tr) {
    if (tr.docChanged) {
      console.log(tr.steps);
    }
    view.updateState(view.state.apply(tr));
  },
});

window.view = view;
