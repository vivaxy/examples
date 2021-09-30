/**
 * @since 2021-07-04
 * @author vivaxy
 */
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { DOMParser, DOMSerializer, Schema, Fragment } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

const schemaWithDecoration = new Schema({
  nodes: schema.spec.nodes,
  marks: {
    ...schema.spec.marks,
    decoration: {
      excludes: '',
      parseDOM: [
        {
          tag: 'decoration',
          getAttrs: (dom) => ({ class: dom.getAttribute('class') || '' }),
        },
      ],
      toDOM: function toDOM(node) {
        return ['decoration', node.attrs, 0];
      },
    },
  },
});

const decorationsPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return DecorationSet.create(doc, [
        Decoration.inline(4, 6, {
          class: 'decoration',
        }),
        Decoration.inline(7, 9, {
          class: 'decoration',
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
        // hack: access `view` globally
        const { from, to } = view.state.selection;
        const decorations = decorationsPlugin
          .getState(view.state)
          .find(from, to)
          .forEach(function (deco) {
            const innerFrom = Math.max(0, deco.from - from);
            const innerTo = Math.min(to - from, deco.to - from);
            const attrs = deco.type.attrs;

            function mapFragment(fragment, f, startPos = 0) {
              let mapped = [];
              let innerPos = 0;
              for (let i = 0; i < fragment.childCount; i++) {
                let child = fragment.child(i);
                if (child.content.size) {
                  child = child.copy(
                    mapFragment(child.content, f, startPos + innerPos),
                  );
                  mapped.push(child);
                } else if (child.isInline) {
                  child = f(child, startPos + innerPos);
                  mapped.push(...child);
                }
                innerPos += child.nodeSize;
              }
              return Fragment.fromArray(mapped);
            }

            content = mapFragment(content, function (node, innerPos) {
              /**
               * cut node by innerFrom, innerTo
               * so there are 3 sections, add mark to (innerFrom, innerTo)
               */
              function withinNode(pos) {
                return Math.min(Math.max(0, pos), node.nodeSize);
              }

              const seg0 = withinNode(innerFrom - innerPos);
              const seg1 = withinNode(innerTo - innerPos);

              let before, middle, after;
              if (seg0 !== 0) {
                before = node.cut(0, seg0);
              }
              if (seg0 !== seg1) {
                middle = node.cut(seg0, seg1);
              }
              if (seg1 !== node.nodeSize) {
                after = node.cut(seg1, node.nodeSize);
              }
              const mapped = [];
              if (before) {
                mapped.push(before);
              }
              if (middle) {
                mapped.push(
                  middle.mark(
                    schemaWithDecoration
                      .mark('decoration', attrs)
                      .addToSet(node.marks),
                  ),
                );
              }
              if (after) {
                mapped.push(after);
              }
              return mapped;
            });
          });
        return DOMSerializer.fromSchema(
          schemaWithDecoration,
        ).serializeFragment(content, { document });
      },
    },
    clipboardParser: {
      parseSlice(dom, { preserveWhitespace, context }) {
        const slice = DOMParser.fromSchema(schemaWithDecoration).parseSlice(
          dom,
          {
            preserveWhitespace,
            context,
          },
        );

        debugger;
        const selectionFrom = context.pos;

        // hack: trigger after content is inserted
        // hack: access view globally
        setTimeout(function () {
          view.dispatch(
            view.state.tr.setMeta(decorationsPlugin, {
              decorations: [],
            }),
          );
        }, 0);
        return slice;
      },
    },
  },
});

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [...exampleSetup({ schema }), decorationsPlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});
