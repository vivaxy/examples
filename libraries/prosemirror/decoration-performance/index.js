/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { MenuItem } from 'prosemirror-menu';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

const ACTION_TYPE = {
  ADD_DECORATIONS: 'add-decorations',
};

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, []);
    },
    apply(tr, decorationSet) {
      decorationSet = decorationSet.map(tr.mapping, tr.doc);
      const action = tr.getMeta(decorationsPlugin);
      if (action?.type === ACTION_TYPE.ADD_DECORATIONS) {
        decorationSet = decorationSet.add(tr.doc, action.decorations);
      }
      return decorationSet;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

function addDecorations(state, dispatch, count) {
  dispatch(
    state.tr.setMeta(decorationsPlugin, {
      type: ACTION_TYPE.ADD_DECORATIONS,
      decorations: Array.from({ length: count }, function () {
        function randomPosition() {
          return Math.floor(Math.random() * state.doc.nodeSize);
        }

        function randomColor() {
          return Math.floor(Math.random() * 256);
        }

        const pos0 = randomPosition();
        const pos1 = randomPosition();
        return Decoration.inline(Math.min(pos0, pos1), Math.max(pos0, pos1), {
          style: `background: rgba(${randomColor()}, ${randomColor()}, ${randomColor()}, 0.1)`,
        });
      }),
    }),
  );
}

const plugins = [
  ...exampleSetup({
    schema,
    menuContent: [
      ...buildMenuItems(schema).fullMenu,
      [
        new MenuItem({
          label: 'Add Decorations',
          run: function (state, dispatch) {
            const count = prompt('Decoration count') || 1;
            addDecorations(state, dispatch, count);
          },
        }),
      ],
    ],
  }),
  decorationsPlugin,
];

const state = EditorState.create({
  schema,
  doc: schema.node(
    'doc',
    null,
    Array.from({ length: 100 }, function () {
      return schema.node('paragraph', null, [
        schema.text('1234567890'.repeat(100)),
      ]);
    }),
  ),
  plugins,
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.editorView = view;
