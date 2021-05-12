/**
 * @since 2021-05-12
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { DOMParser, DOMSerializer } from 'prosemirror-model';

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
      return DecorationSet.create(doc, [
        Decoration.inline(node0From + 2, node0To - 2, {
          style: 'background: rgb(100, 255, 255)',
        }),
      ]);
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

setTimeout(function () {
  const fragment = DOMSerializer.fromSchema(schema).serializeFragment(
    state.doc,
  );
  console.log('fragment without decorations', fragment);

  const json = state.doc.toJSON();
  console.log('json without decorations', json);
}, 100);
