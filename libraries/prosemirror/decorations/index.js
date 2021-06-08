/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

const ACTION_TYPE = {
  ADD_DECORATION: 'add-decoration',
};

function nodeRange(doc, index) {
  if (index >= doc.content.content.length) {
    throw RangeError('unexpected index');
  }
  let pos = 0;
  for (let i = 0; i < index; i++) {
    pos += doc.content.content[i].nodeSize;
  }
  return [pos, pos + doc.content.content[index].nodeSize];
}

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      const [node0From, node0To] = nodeRange(doc, 0);
      const [node1From, node1To] = nodeRange(doc, 1);
      const [node2From, node2To] = nodeRange(doc, 2);
      const [node3From, node3To] = nodeRange(doc, 3);
      return DecorationSet.create(doc, [
        Decoration.inline(node0From + 1, node0To - 1, {
          style: 'background: rgb(100, 255, 255)',
        }),
        Decoration.inline(
          node1From + 1,
          node1To - 1,
          {
            style: 'background: rgb(100, 255, 255)',
          },
          {
            inclusiveStart: true,
            inclusiveEnd: true,
          },
        ),
        Decoration.node(node2From + 1, node2To - 1, {
          style: 'border: 1px solid rgb(255, 100, 255)',
        }),
        Decoration.widget(node3To - 1 - 1, function toDOM() {
          const widget = document.createElement('span');
          widget.innerHTML = '(WIDGET)';
          return widget;
        }),
      ]);
    },
    apply(tr, decorationSet) {
      decorationSet = decorationSet.map(tr.mapping, tr.doc);
      const action = tr.getMeta(decorationsPlugin);
      if (action?.type === ACTION_TYPE.ADD_DECORATION) {
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

let state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [decorationsPlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

const $addDecoration = document.querySelector('#add-decoration');
$addDecoration.addEventListener('click', function () {
  const [node4From, node4To] = nodeRange(state.doc, 4);
  const tr = state.tr.setMeta(decorationsPlugin, {
    type: ACTION_TYPE.ADD_DECORATION,
    decorations: [
      Decoration.inline(node4To - 1 - 5, node4To - 1 - 1, {
        style: 'background-color: rgba(255, 255, 0, 0.3)',
      }),
    ],
  });
  state = state.apply(tr);
  view.updateState(state);
});

window.view = view;
