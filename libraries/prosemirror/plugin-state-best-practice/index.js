/**
 * @since 2024-04-09
 * @author vivaxy
 */
import { EditorState, Plugin } from 'prosemirror-state';
import { EditorView, DecorationSet, Decoration } from 'prosemirror-view';
import { schema } from 'prosemirror-schema-basic';

let inParentheses = false;
const useGlobalStatePlugin = new Plugin({
  state: {
    init() {
      return DecorationSet.empty;
    },
    apply(tr, prev, oldEditorState) {
      if (tr.getMeta('addParentheses')) {
        const text = inParentheses ? ')' : '(';
        const newDecoration = Decoration.widget(
          tr.selection.to,
          function () {
            const widget = document.createElement('span');
            widget.innerHTML = text;
            return widget;
          },
          {
            side: -1,
          },
        );
        inParentheses = !inParentheses;
        return prev.add(tr.doc, [newDecoration]);
      }
      return prev.map(tr.mapping, tr.doc);
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
  },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    schema,
    doc: schema.nodes.doc.create(
      null,
      schema.nodes.paragraph.create(
        null,
        schema.text(
          'Enter texts and press `Add Parentheses` button. You will get parentheses in pairs.',
        ),
      ),
    ),
    plugins: [useGlobalStatePlugin],
  }),
});

document
  .getElementById('add-parentheses')
  .addEventListener('click', function () {
    view.dispatch(view.state.tr.setMeta('addParentheses', true));
    view.focus();
  });

document
  .getElementById('add-parentheses-dropped-tr')
  .addEventListener('click', function () {
    view.state.apply(view.state.tr.setMeta('addParentheses', true));
    view.focus();
  });

function createAnotherEditorFirst() {
  alert('Create another editor first');
}

const addParenthesesToAnotherEditorButton = document.getElementById(
  'add-parentheses-to-another-editor',
);

addParenthesesToAnotherEditorButton.addEventListener(
  'click',
  createAnotherEditorFirst,
);

document
  .getElementById('create-another-editor')
  .addEventListener('click', function () {
    const view = new EditorView(document.querySelector('#another-editor'), {
      state: EditorState.create({
        schema,
        doc: schema.nodes.doc.create(
          null,
          schema.nodes.paragraph.create(
            null,
            schema.text(
              'Enter texts and press `Add Parentheses` button. You may not get parentheses in pairs.',
            ),
          ),
        ),
        plugins: [useGlobalStatePlugin],
      }),
    });

    addParenthesesToAnotherEditorButton.removeEventListener(
      'click',
      createAnotherEditorFirst,
    );
    addParenthesesToAnotherEditorButton.addEventListener('click', function () {
      view.dispatch(view.state.tr.setMeta('addParentheses', true));
      view.focus();
    });
  });
