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
        Decoration.inline(
          189,
          190,
          {
            style: 'background: rgb(100, 255, 255)',
          },
          {
            type: 'inline',
            user: '1111',
            color: 'rgb(100, 255, 255)',
          },
        ),
        Decoration.widget(
          190,
          function () {
            const $root = document.createElement('span');
            $root.classList.add('cursor-container');
            const $cursor = document.createElement('span');
            $cursor.classList.add('cursor');
            // $user.textContent = 'vivaxy';
            $root.addEventListener('mouseover', function () {
              console.log('hover');
            });
            $root.appendChild($cursor);
            return $root;
          },
          {
            type: 'widget',
            user: '2222',
            color: 'rgb(255, 100, 255)',
          },
        ),
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
  view(editorView) {
    const mouseMoveHandler = function (e) {
      const { pos } = editorView.posAtCoords({
        left: e.clientX - editorView.dom.clientLeft,
        top: e.clientY - editorView.dom.clientTop,
      });
      const decorationSet = decorationsPlugin.getState(editorView.state);
      const found = decorationSet.find(pos, pos);
      const deco = found.sort(function (prev, next) {
        if (next.spec.type === 'widget') {
          return 1;
        } else if (prev.spec.type === 'widget') {
          return -1;
        }
        return 0;
      });
      if (deco.length) {
        $flag.style.display = 'block';
        $flag.style.left = `${e.clientX}px`;
        $flag.style.top = `${e.clientY - 30}px`;
        $flag.style.background = deco[0].spec.color;
        $flag.textContent = deco[0].spec.user;
      } else {
        $flag.style.display = 'none';
      }
    };
    const $flag = document.createElement('div');
    $flag.classList.add('flag');
    $flag.style.position = 'absolute';
    $flag.style.display = 'none';
    document.body.appendChild($flag);
    editorView.dom.addEventListener('mousemove', mouseMoveHandler);
    return {
      destroy() {
        editorView.dom.removeEventListener('mousemove', mouseMoveHandler);
      },
    };
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
