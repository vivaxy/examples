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
        schema.mark('color', { color: 'red' }), // effective in PM Model, but not in PM View
        schema.mark('color', { color: 'green' }), // effective mark
      ]),
    ]),
  ]),
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});
window.view = view;

view.dispatch(
  view.state.tr.removeMark(1, 2, schema.mark('color', { color: 'green' })),
);
view.dispatch(
  view.state.tr.addMark(1, 2, schema.mark('color', { color: 'green' })),
); // red mark is removed.
