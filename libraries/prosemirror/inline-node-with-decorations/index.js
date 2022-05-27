/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { DOMParser, Schema } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';

const schema = new Schema({
  nodes: basicSchema.spec.nodes.append({
    x: {
      content: 'text*',
      group: 'inline',
      inline: true,
      defining: true,
      parseDOM: [{ tag: 'x' }],
      toDOM() {
        return ['x', 0];
      },
    },
  }),
  marks: basicSchema.spec.marks,
});

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: exampleSetup({ schema }),
});
const view = new EditorView(document.querySelector('#editor'), {
  state,
  decorations(state) {
    return DecorationSet.create(state.doc, [
      Decoration.inline(2, 6, {
        class: 'x',
      }),
    ]);
  },
});

window.view = view;
