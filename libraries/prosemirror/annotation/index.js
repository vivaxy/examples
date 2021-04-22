/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'https://cdn.skypack.dev/prosemirror-schema-basic';
import { EditorState } from 'https://cdn.skypack.dev/prosemirror-state';
import { EditorView } from 'https://cdn.skypack.dev/prosemirror-view';
import { DOMParser } from 'https://cdn.skypack.dev/prosemirror-model';

import {
  annotationHighlightPlugin,
  createAnnotationHandlePlugin,
} from './annotation/index.js';

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
