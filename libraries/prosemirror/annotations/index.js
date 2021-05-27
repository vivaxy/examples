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
  pluginKey,
} from './annotations';

const state = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [
    annotationHighlightPlugin,
    createAnnotationHandlePlugin((transaction) => {
      const newState = state.apply(transaction);
      view.updateState(newState);
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

document
  .querySelector('#get-current-annotations')
  .addEventListener('click', function () {
    const annotationPluginState = annotationPluginKey.getState(
      editorView.state,
    );
    const annotations = annotationPluginState.decorationSet
      .find()
      .map(function ({ from, to, type }) {
        const { id, text } = type.spec.annotation;
        return { from, to, id, text };
      });
    console.log('annotations', annotations);
  });

window.editorView = view;
window.annotationHighlightPlugin = annotationHighlightPlugin;
window.annotationPluginKey = pluginKey;
