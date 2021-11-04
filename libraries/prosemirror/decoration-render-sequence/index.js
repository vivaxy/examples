/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, Decoration, DecorationSet } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

const mySchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block').append({
    custom_node: {
      group: 'block',
      content: '',
      parseDOM: [{ tag: 'custom-node' }],
      toDOM() {
        return ['custom-node', 0];
      },
    },
  }),
  marks: schema.spec.marks,
});

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      console.log('plugin.init');
      return DecorationSet.create(doc, [
        Decoration.widget(1, function toDOM() {
          console.log('decoration.toDOM');
          const widget = document.createElement('span');
          widget.innerHTML = '(WIDGET)';
          return widget;
        }),
      ]);
    },
    apply(tr, decorationSet) {
      console.log('plugin.apply');
      return decorationSet.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      console.log('props.decorations');
      return this.getState(state);
    },
  },
});

const customNodePlugin = new Plugin({
  props: {
    nodeViews: {
      custom_node() {
        console.log('nodeViews.node');
        const dom = document.createElement('div');
        dom.innerHTML = '(CUSTOM_NODE)';
        return {
          dom,
          update() {
            console.log('nodeViews.node.update');
          },
          destroy() {
            console.log('nodeViews.node.destroy');
          },
        };
      },
    },
  },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: [
      ...exampleSetup({ schema: mySchema }),
      decorationsPlugin,
      customNodePlugin,
    ],
  }),
});

window.view = view;
