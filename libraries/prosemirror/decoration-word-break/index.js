/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, [
        Decoration.inline(189, 190, {
          style: 'background: rgb(100, 255, 255)',
        }),
        Decoration.widget(190, function () {
          const $cursor = document.createElement('span');
          $cursor.classList.add('cursor');
          const $user = document.createElement('span');
          $user.classList.add('user');
          $user.textContent = 'vivaxy';
          $cursor.appendChild($user);
          return $cursor;
        }),
      ]);
    },
    apply(tr, decorationSet) {
      return decorationSet.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
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
