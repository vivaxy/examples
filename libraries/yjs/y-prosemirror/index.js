/**
 * @since 2021-06-28
 * @author vivaxy
 */
import * as Y from 'yjs';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { schema } from 'prosemirror-schema-basic';
import * as awarenessProtocol from 'y-protocols/awareness';
import {
  ySyncPlugin,
  ySyncPluginKey,
  yCursorPlugin,
  yUndoPlugin,
  undo,
  redo,
} from 'y-prosemirror';

function onUpdate(update, fromYDoc) {
  editors.forEach(function ({ editorView }) {
    const yDoc = editorView.state[ySyncPluginKey.key].doc;
    if (yDoc !== fromYDoc) {
      Y.applyUpdate(yDoc, update);
    }
  });
}

function onAwareness(update, fromYDoc) {
  editors.forEach(function ({ editorView, provider }) {
    const yDoc = editorView.state[ySyncPluginKey.key].doc;
    if (yDoc !== fromYDoc) {
      awarenessProtocol.applyAwarenessUpdate(provider.awareness, update);
    }
  });
}

function createEditor(rootSelector, onUpdate, onAwareness) {
  const yDoc = new Y.Doc();
  const type = yDoc.get('prosemirror', Y.XmlFragment);

  function handleYDocUpdate(update, origin) {
    console.log('yDoc', yDoc);
    if (origin !== null) {
      onUpdate(update, yDoc);
    }
  }

  function handleAwareness(_, origin) {
    if (origin === 'local') {
      const update = awarenessProtocol.encodeAwarenessUpdate(
        provider.awareness,
        [yDoc.clientID],
      );
      onAwareness(update, provider.awareness, yDoc);
    }
  }

  yDoc.on('update', handleYDocUpdate);

  const provider = {
    awareness: new awarenessProtocol.Awareness(yDoc),
  };

  provider.awareness.on('update', handleAwareness);

  const editorView = new EditorView(document.querySelector(rootSelector), {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(type),
        yCursorPlugin(provider.awareness),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ].concat(exampleSetup({ schema })),
    }),
  });

  return {
    editorView,
    provider,
  };
}

const editors = [
  createEditor('#editor-1', onUpdate, onAwareness),
  createEditor('#editor-2', onUpdate, onAwareness),
];
window.editors = editors;
