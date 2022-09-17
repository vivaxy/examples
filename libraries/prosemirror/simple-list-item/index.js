/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { findWrapping } from 'prosemirror-transform';
import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';
import { inputRules, InputRule } from 'prosemirror-inputrules';
import { keydownHandler } from 'prosemirror-keymap';

const list_item = {
  group: 'block',
  content: 'paragraph+',
  attrs: {
    indent: { default: 0 },
    listIndex: { default: null },
  },
  parseDOM: [
    {
      tag: 'list-item',
    },
  ],
  toDOM(node) {
    return [
      'list-item',
      {
        'data-indent': node.attrs.indent,
        'data-list-index': node.attrs.listIndex,
      },
      0,
    ];
  },
};

const mySchema = new Schema({
  nodes: schema.spec.nodes.addToEnd('list_item', list_item),
  marks: schema.spec.marks,
});

const listItemInputRule = new InputRule(
  new RegExp(/^[*-]\s$/),
  (state, match, start, end) => {
    const range = state.tr.doc.resolve(start).blockRange();
    if (range.parent.type === mySchema.nodes.list_item) {
      return false;
    }
    const { tr } = view.state;
    tr.delete(start, end);
    const newRange = tr.doc.resolve(start).blockRange();
    tr.wrap(newRange, [{ type: mySchema.nodes.list_item }]);
    return tr;
  },
);

const inputRulePlugin = inputRules({ rules: [listItemInputRule] });

function findParentNodeClosestToPos($pos, predicate) {
  for (let i = $pos.depth; i > 0; i--) {
    const node = $pos.node(i);
    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      };
    }
  }
}

const keymap = {
  Tab(state, dispatch, view) {
    const $node = findParentNodeClosestToPos(
      state.selection.$from,
      (node) => node.type === mySchema.nodes.list_item,
    );

    if ($node) {
      dispatch(
        state.tr.setNodeMarkup($node.pos, $node.node.type, {
          ...$node.node.attrs,
          indent: $node.node.attrs.indent + 1,
        }),
      );
      return true;
    }
  },
  'Shift-Tab'(state, dispatch, view) {
    const $node = findParentNodeClosestToPos(
      state.selection.$from,
      (node) => node.type === mySchema.nodes.list_item,
    );

    if ($node && $node.node.attrs.indent > 0) {
      dispatch(
        state.tr.setNodeMarkup($node.pos, $node.node.type, {
          ...$node.node.attrs,
          indent: $node.node.attrs.indent - 1,
        }),
      );
      return true;
    }
  },
};

const listIndexPlugin = new Plugin({
  key: new PluginKey('list-index'),
  appendTransaction(_, oldState, newState) {
    let currentIndex = [];
    let updated = false;
    const { tr } = newState;
    newState.doc.content.descendants(function (node, pos) {
      if (node.type === mySchema.nodes.list_item) {
        currentIndex[node.attrs.indent] =
          (currentIndex[node.attrs.indent] || 0) + 1;
        currentIndex.length = node.attrs.indent + 1;
        const listIndex = currentIndex.join('.');
        if (node.attrs.listIndex !== listIndex) {
          tr.setNodeMarkup(pos, mySchema.nodes.list_item, {
            ...node.attrs,
            listIndex,
          });
          updated = true;
        }
      }
    });
    if (updated) {
      return tr;
    }
    return false;
  },
  props: { handleKeyDown: keydownHandler(keymap) },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(mySchema).parse(
      document.querySelector('#content'),
    ),
    plugins: [
      ...exampleSetup({ schema: mySchema }),
      inputRulePlugin,
      listIndexPlugin,
    ],
  }),
});

window.view = view;
