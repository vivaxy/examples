/**
 * @since 2021-05-19
 * @author vivaxy
 */
import { EditorView } from 'prosemirror-view';
import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';

import {
  MESSAGE_TYPE,
  MESSAGE_TYPE_EDIT_STEP,
  MESSAGE_TYPE_INIT,
  MESSAGE_TYPE_SYNC_DOC,
  MESSAGE_TYPE_SYNC_STEPS,
  createStateFromDoc,
  createStateFromSerializedDoc,
  createStateFromDOM,
  schema,
} from './common';

export function init() {
  const clientID = window.name;
  document.title = clientID;
  // event
  window.addEventListener('message', function (e) {
    if (e.data.type === MESSAGE_TYPE) {
      handleMessage(e.data.data);
    }
  });

  // editor
  let version = 0;
  let unsettledSteps = [];
  const state = createStateFromDOM(document.querySelector('#content'));
  let prevDoc = state.doc;

  const view = new EditorView(document.querySelector('#editor'), {
    state,
    dispatchTransaction(transaction) {
      prevDoc = view.state.doc;
      const newState = view.state.apply(transaction);
      view.updateState(newState);
      if (transaction.steps.length && !transaction.getMeta('remote')) {
        // selection change may cause transaction, but it should not sendMessage
        unsettledSteps = transaction.steps;
        prevDoc = state.doc;
        sendMessage({
          type: MESSAGE_TYPE_EDIT_STEP,
          version: version,
          steps: unsettledSteps.map((step) => step.toJSON()),
          clientID,
        });
      }
    },
  });

  // collab
  function handleMessage(data) {
    if (data.type === MESSAGE_TYPE_SYNC_DOC) {
      const newState = createStateFromDoc(Node.fromJSON(schema, data.doc));
      view.updateState(newState);
      version = data.version;
    }

    if (data.type === MESSAGE_TYPE_SYNC_STEPS) {
      if (data.clientID === clientID) {
        // from self
        unsettledSteps = [];
      } else {
        // revert unsettled steps
        const invertedSteps = unsettledSteps
          .map(function (step) {
            return step.invert(prevDoc);
          })
          .reverse();
        const { tr } = view.state;

        invertedSteps.forEach(function (step) {
          tr.step(step);
        });

        invertedSteps.forEach(function (step) {
          tr.step(step);
        });
        // play sync steps
        data.steps.forEach(function (step) {
          const s = Step.fromJSON(schema, step);
          tr.step(s);
        });

        tr.setMeta('remote', true);

        view.dispatch(tr);
      }
      version = data.version;
    }
  }

  function sendMessage(data) {
    window.opener.postMessage(
      {
        type: MESSAGE_TYPE,
        data,
      },
      location.origin,
    );
  }

  // init
  sendMessage({
    type: MESSAGE_TYPE_INIT,
  });
}
