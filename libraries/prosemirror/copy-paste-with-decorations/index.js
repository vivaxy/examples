/**
 * @since 2021-07-04
 * @author vivaxy
 */
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { DOMParser, DOMSerializer } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, [
        Decoration.inline(4, 7, {
          style: 'background: rgb(100, 255, 255)',
        }),
      ]);
    },
    apply(tr, prevState) {
      return prevState;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
    clipboardSerializer: {
      serializeFragment(content, { document }) {
        const node = DOMSerializer.fromSchema(schema).serializeFragment(
          content,
          {
            document,
          },
        );
        const meta = document.createElement('meta');
        // warning: accessing `view` globally
        const { from, to } = view.state.selection;
        const decorations = decorationsPlugin
          .getState(view.state)
          .find(from, to)
          .map(function (dec) {
            return {
              from: dec.from,
              to: dec.to,
              attrs: dec.type.attrs,
              spec: dec.spec,
            };
          });
        if (decorations.length) {
          meta.setAttribute('name', 'decorations');
          meta.setAttribute(
            'content',
            JSON.stringify({ decorations, selection: { from, to } }),
          );
          node.appendChild(meta);
          console.log(
            'copy or cut with decorations',
            decorations,
            'selection',
            { from, to },
          );
        }
        return node;
      },
    },
    clipboardParser: {
      parseSlice(dom, { preserveWhitespace, context }) {
        const meta = dom.querySelector('meta[name="decorations"]');
        if (meta) {
          const { decorations, selection } = JSON.parse(
            meta.getAttribute('content'),
          );
          meta.remove();
          console.log(
            'paste with decorations',
            decorations,
            'selection',
            selection,
          );
          // TODO: calculate new decoration position
          // TODO: set to decorationSet (better after paste is done)
        }
        return DOMParser.fromSchema(schema).parseSlice(dom, {
          preserveWhitespace,
          context,
        });
      },
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

console.warn('⚠️ Not finished!');
