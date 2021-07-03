/**
 * @since 2021-06-30
 * @author vivaxy
 *
 * testcases:
 *  - select text to add annotation and sync
 *  - click annotation to show tooltip
 *  - click tooltip to delete annotation and sync
 *  - edit doc, annotation position follows and sync
 *
 * bugs:
 *  - Add annotation; type to add a character before annotation, local annotation move to left, but remote annotation is correct.
 *      Because yDoc(ySyncPlugin.state.doc) updated in `setTimeout`(https://github.com/yjs/y-prosemirror/blob/9063796fd4e4f45001caec36ab4e3b2e348088c5/src/plugins/sync-plugin.js#L113).
 *      The `relPosToAbsPos` relies on the yDoc, but the yDoc is not change, so it mapped to the original absPos(the left of the correct absPos).
 *      This transaction is triggerred by ProseMirror, so use `decorationSet.map` is just fine.
 *
 * TODO:
 *  - why setInitialStateToYDoc breaks the sync
 */
import * as Y from 'yjs';
import { EditorView } from 'prosemirror-view';
import { EditorState } from 'prosemirror-state';
import { schema } from 'prosemirror-schema-basic';
import { DOMParser, Slice } from 'prosemirror-model';
import * as awarenessProtocol from 'y-protocols/awareness';
import {
  ySyncPlugin,
  ySyncPluginKey,
  yCursorPlugin,
  prosemirrorToYDoc,
} from 'y-prosemirror';
import {
  createAnnotationPlugin,
  createAnnotationHandlePlugin,
  annotationHandlePluginKey,
} from './annotations';
import { ORIGINS } from './annotations/common';

function broadcastUpdate(update, fromYDoc) {
  editors.forEach(function ({ yDoc }) {
    if (yDoc !== fromYDoc) {
      Y.applyUpdate(yDoc, update);
    }
  });
}

function broadcastAwareness(update, fromYDoc) {
  editors.forEach(function ({ yDoc, awareness }) {
    if (yDoc !== fromYDoc) {
      awarenessProtocol.applyAwarenessUpdate(awareness, update, ySyncPluginKey);
    }
  });
}

function broadcastAnnotation(update, fromYDoc) {
  editors.forEach(function ({ editorView, yDoc }) {
    if (yDoc !== fromYDoc) {
      const tr = editorView.state.tr.setMeta(annotationHandlePluginKey, {
        type: update.type,
        id: update.id,
        from: update.from,
        to: update.to,
        text: update.text,
        origin: ORIGINS.REMOTE,
      });
      applyTransactionToEditorView(editorView, tr);
    }
  });
}

function applyTransactionToEditorView(editorView, tr) {
  const newState = editorView.state.apply(tr);
  editorView.updateState(newState);
}

function createEditor(
  rootSelector,
  handleUpdate,
  handleAwareness,
  handleAnnotation,
) {
  const yDoc = new Y.Doc();
  const yXml = yDoc.getXmlFragment('prosemirror');
  const awareness = new awarenessProtocol.Awareness(yDoc);

  function _handleYDocUpdate(update, origin) {
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

  function _handleAnnotation(annotationChange) {
    handleAnnotation(annotationChange, yDoc);
  }

  function applyTransaction(tr) {
    const newState = editorView.state.apply(tr);
    editorView.updateState(newState);
  }

  yDoc.on('update', _handleYDocUpdate);
  awareness.on('update', _handleAwareness);

  const editorView = new EditorView(document.querySelector(rootSelector), {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(yXml),
        yCursorPlugin(awareness),
        createAnnotationPlugin(rootSelector, _handleAnnotation),
        createAnnotationHandlePlugin(
          rootSelector,
          yDoc,
          applyTransaction,
          _handleAnnotation,
        ),
      ],
      annotations: [],
    }),
  });

  return {
    editorView,
    yDoc,
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

function setInitialStateToProseMirror(editor) {
  const { editorView } = editor;
  const tr = editorView.state.tr.replace(
    0,
    editorView.state.doc.content.size,
    new Slice(
      DOMParser.fromSchema(schema).parse(
        document.querySelector('#content'),
      ).content,
      0,
      0,
    ),
  );
  const newState = editorView.state.apply(tr);
  editorView.updateState(newState);
}

function setInitialStateToYDoc(editor) {
  // this breaks sync
  const { yDoc } = editor;

  const newYDoc = prosemirrorToYDoc(
    DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  );

  const update = Y.encodeStateAsUpdate(newYDoc);
  Y.applyUpdate(yDoc, update);
}

// setInitialStateToYDoc(editors[0]);
// setInitialStateToYDoc(editors[1]);
setInitialStateToProseMirror(editors[0]);
