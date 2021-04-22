/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState, Plugin } from 'https://cdn.skypack.dev/prosemirror-state';
import {
  EditorView,
  DecorationSet,
  Decoration,
} from 'https://cdn.skypack.dev/prosemirror-view';
import { DOMParser } from 'https://cdn.skypack.dev/prosemirror-model';

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
      return decorationSet.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      return decorationsPlugin.getState(state);
    },
  },
});

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [decorationsPlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});
