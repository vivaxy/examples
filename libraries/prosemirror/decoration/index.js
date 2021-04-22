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
    pos += state.doc.content.content[i].nodeSize;
  }
  return [pos, pos + state.doc.content.content[index].nodeSize];
}

const purplePlugin = new Plugin({
  props: {
    decorations(state) {
      return DecorationSet.create(state.doc, [
        Decoration.inline(...nodeRange(state.doc, 0), {
          style: 'background: rgb(100, 255, 255)',
        }),
        Decoration.node(...nodeRange(state.doc, 1), {
          style: 'border: 1px solid rgb(255, 100, 255)',
        }),
        Decoration.widget(nodeRange(state.doc, 2)[1] - 2, function toDOM(
          view,
          getPos,
        ) {
          const widget = document.createElement('span');
          widget.innerHTML = '(WIDGET)';
          return widget;
        }),
      ]);
    },
  },
});

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [purplePlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});
