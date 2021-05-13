/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';

import {
  annotationHighlightPlugin,
  createAnnotationHandlePlugin,
} from './annotations/index.js';

let state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [
    annotationHighlightPlugin,
    createAnnotationHandlePlugin((transaction) => {
      state = state.apply(transaction);
      view.updateState(state);
    }),
  ],
  annotations: [
    {
      id: 0,
      text: '1234567890',
      from: 111,
      to: 117,
    },
  ],
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
});

window.editorView = view;
