/**
 * @since 2021-04-13 10:27
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
  marks: {
    strong: {
      attrs: {
        'data-id': { default: 0 },
      },
      parseDOM: [
        {
          tag: 'strong',
          getAttrs: function (node) {
            return {
              'data-id': node.getAttribute('data-id'),
            };
          },
        },
      ],
      toDOM(node) {
        const attrs = {
          'data-id': node.attrs['data-id'] || Date.now(),
        };
        return ['strong', attrs, 0];
      },
    },
  },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: exampleSetup({ schema: mySchema }),
  }),
});
