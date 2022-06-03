/**
 * @since 2021-05-19
 * @author vivaxy
 */
import { DOMSerializer } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { Step } from 'prosemirror-transform';

import {
  MESSAGE_TYPE,
  MESSAGE_TYPE_EDIT_STEP,
  MESSAGE_TYPE_INIT,
  MESSAGE_TYPE_SYNC_DOC,
  MESSAGE_TYPE_SYNC_STEPS,
  createStateFromDOM,
  createStateFromDoc,
  schema,
} from './common';
import Authority from './authority';

export function init() {
  let replicaIndex = 0;
  const replicas = [];

  // button
  const $openANewEditor = document.querySelector('#open-a-new-editor');
  $openANewEditor.removeAttribute('hidden');
  $openANewEditor.addEventListener('click', function () {
    const newWindow = window.open(location.href, `replica-${replicaIndex++}`);
    replicas.push(newWindow);
  });

  // event
  window.addEventListener('message', function (e) {
    if (e.data.type === MESSAGE_TYPE) {
      handleMessage(e.data.data);
    }
  });

  // editor
  const state = createStateFromDOM(document.querySelector('#content'));

  const view = new EditorView(document.querySelector('#editor'), {
    state,
    editable: function () {
      return false;
    },
  });

  // collab
  const authority = new Authority(view.state.doc);

  function handleMessage({ type, version, steps: stepsInJSON, clientID }) {
    if (type === MESSAGE_TYPE_INIT) {
      // sync doc to replica
      sendMessage({
        type: MESSAGE_TYPE_SYNC_DOC,
        doc: authority.doc.toJSON(),
        version: authority.version,
      });
    }

    if (type === MESSAGE_TYPE_EDIT_STEP) {
      const steps = stepsInJSON.map((step) => Step.fromJSON(schema, step));
      const applied = authority.receiveSteps(version, steps, clientID);
      if (applied) {
        const newState = createStateFromDoc(authority.doc);
        view.updateState(newState);
        sendMessage({
          type: MESSAGE_TYPE_SYNC_STEPS,
          steps: stepsInJSON,
          version: authority.version,
          clientID,
        });
      }
    }
  }

  function sendMessage(data) {
    replicas.forEach(function (replica) {
      replica.postMessage(
        {
          type: MESSAGE_TYPE,
          data,
        },
        location.origin,
      );
    });
  }
}
