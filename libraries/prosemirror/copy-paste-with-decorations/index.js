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
    apply(tr, prevState, oldEditorState, newEditorState) {
      const meta = tr.getMeta(decorationsPlugin);
      if (meta) {
        const newDecorations = meta.decorations.map(function (deco) {
          const { from, to, attrs, spec } = deco;
          return Decoration.inline(from, to, attrs, spec);
        });
        return prevState.add(newEditorState.doc, newDecorations);
      }
      if (tr.docChanged) {
        return prevState.map(tr.mapping, tr.doc);
      }
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
        // hack: access `view` globally
        const { from, to } = view.state.selection;
        const decorations = decorationsPlugin
          .getState(view.state)
          .find(from, to)
          .map(function (deco) {
            return {
              // TODO: `1` for the paragraph padding. Is it always `1`?
              from: Math.max(0, deco.from - from) + 1,
              to: Math.min(to - from, deco.to - from) + 1,
              attrs: deco.type.attrs,
              spec: deco.spec,
            };
          });
        if (decorations.length) {
          meta.setAttribute('name', 'decorations');
          meta.setAttribute('content', JSON.stringify(decorations));
          node.appendChild(meta);
          console.log('copy or cut with decorations', decorations);
        }
        return node;
      },
    },
    clipboardParser: {
      parseSlice(dom, { preserveWhitespace, context }) {
        const meta = dom.querySelector('meta[name="decorations"]');
        if (meta) {
          const decorations = JSON.parse(meta.getAttribute('content'));
          console.log('paste with decorations', decorations);
          meta.remove();
          // calculate new decoration position
          const selectionFrom = context.pos;
          const mappedDecorations = decorations.map(function (deco) {
            const { from, to, attrs, spec } = deco;
            // TODO: `1` for the paragraph padding. Is it always `1`?
            return {
              from: selectionFrom + from - 1,
              to: selectionFrom + to - 1,
              attrs,
              spec,
            };
          });
          // hack: trigger after content is inserted
          // hack: access view globally
          setTimeout(function () {
            view.dispatch(
              view.state.tr.setMeta(decorationsPlugin, {
                decorations: mappedDecorations,
              }),
            );
          }, 0);
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
