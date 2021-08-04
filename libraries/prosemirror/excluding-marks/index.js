/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as _schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';

const schema = new Schema({
  nodes: _schema.spec.nodes,
  marks: {
    ..._schema.spec.marks,
    color: {
      attrs: {
        color: { default: 'black' },
      },
      parseDOM: [
        {
          priority: 20,
          tag: 'span[style*=color]',
          getAttrs: (dom) => ({ color: dom.style.color }),
        },
      ],
      toDOM(node) {
        return ['span', { style: `color: ${node.attrs.color}` }];
      },
    },
  },
});

const state = EditorState.create({
  schema,
  doc: schema.node('doc', {}, [
    schema.node('paragraph', {}, [
      schema.text('A', [
        schema.mark('color', { color: 'red' }),
        schema.mark('color', { color: 'green' }),
      ]),
    ]),
  ]),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});
