/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';
import { keymap } from 'prosemirror-keymap';
import { baseKeymap } from 'prosemirror-commands';
import { history } from 'prosemirror-history';

const doc = {
  content: 'block+',
};

const paragraph = {
  content: 'inline*',
  group: 'block',
  isolating: true,
  parseDOM: [{ tag: 'p' }],
  toDOM() {
    return ['p', 0];
  },
};

const text = {
  group: 'inline',
};

const horizontal_rule = {
  group: 'block',
  parseDOM: [{ tag: 'hr' }],
  toDOM() {
    return ['hr'];
  },
};

const schema = new Schema({
  nodes: { doc, paragraph, text, horizontal_rule },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
    plugins: [keymap(baseKeymap), history()],
  }),
});

window.view = view;
