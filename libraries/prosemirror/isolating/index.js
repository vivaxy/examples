/**
 * @since 2021-03-26 15:10
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, DOMParser } from 'prosemirror-model';

const doc = {
  content: 'block+',
};

const paragraph = {
  content: 'inline*',
  group: 'block',
  // isolating: true,
  parseDOM: [{ tag: 'p' }],
  toDOM() {
    return ['p', 0];
  },
};

const text = {
  group: 'inline',
};

const schema = new Schema({
  nodes: { doc, paragraph, text },
});

const view = new EditorView(document.querySelector('#editor'), {
  state: EditorState.create({
    doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  }),
});

window.view = view;
