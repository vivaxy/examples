/**
 * @since 2021-06-30
 * @author vivaxy
 */
import * as Y from 'yjs';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { DOMParser, Slice } from 'prosemirror-model';
import * as awarenessProtocol from 'y-protocols/awareness';
import { ySyncPlugin, ySyncPluginKey, yCursorPlugin } from 'y-prosemirror';
import {
  createAnnotationPlugin,
  createAnnotationHandlePlugin,
} from './annotations';

function broadcastUpdate(update, fromYDoc) {
  editors.forEach(function ({ editorView }) {
    const yDoc = ySyncPluginKey.getState(editorView.state).doc;
    if (yDoc !== fromYDoc) {
      Y.applyUpdate(yDoc, update);
    }
  });
}

function broadcastAwareness(update, fromYDoc) {
  editors.forEach(function ({ editorView, awareness }) {
    const yDoc = ySyncPluginKey.getState(editorView.state).doc;
    if (yDoc !== fromYDoc) {
      awarenessProtocol.applyAwarenessUpdate(awareness, update, ySyncPluginKey);
    }
  });
}

function broadcastAnnotation(update, fromYDoc) {}

function createEditor(
  rootSelector,
  handleUpdate,
  handleAwareness,
  handleAnnotation,
) {
  const yDoc = new Y.Doc();
  const yXml = yDoc.get('prosemirror', Y.XmlFragment);
  const awareness = new awarenessProtocol.Awareness(yDoc);

  function handleYDocUpdate(update, origin) {
    // origin === PluginKey("..."): local update
    // origin === null: remote update
    if (origin !== null) {
      handleUpdate(update, yDoc, origin);
    }
  }

  function _handleAwareness(_, origin) {
    if (origin === 'local') {
      const update = awarenessProtocol.encodeAwarenessUpdate(awareness, [
        yDoc.clientID,
      ]);
      handleAwareness(update, yDoc);
    }
  }

  yDoc.on('update', handleYDocUpdate);
  awareness.on('update', _handleAwareness);

  const editorView = new EditorView(document.querySelector(rootSelector), {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(yXml),
        yCursorPlugin(awareness),
        createAnnotationPlugin(rootSelector, yDoc),
        createAnnotationHandlePlugin(rootSelector, yDoc, function (tr) {
          const newState = editorView.state.apply(tr);
          editorView.updateState(newState);
        }),
      ],
    }),
  });

  return {
    editorView,
    awareness,
  };
}

const editors = [
  createEditor(
    '#editor-1',
    broadcastUpdate,
    broadcastAwareness,
    broadcastAnnotation,
  ),
  createEditor(
    '#editor-2',
    broadcastUpdate,
    broadcastAwareness,
    broadcastAnnotation,
  ),
];

window.editors = editors;

const firstEditorView = editors[0].editorView;
const tr = firstEditorView.state.tr.replace(
  0,
  firstEditorView.state.doc.content.size,
  new Slice(
    DOMParser.fromSchema(schema).parse(
      document.querySelector('#content'),
    ).content,
    0,
    0,
  ),
);
const newState = firstEditorView.state.apply(tr);
firstEditorView.updateState(newState);
