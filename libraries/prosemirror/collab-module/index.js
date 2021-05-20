/**
 * @since 2021-05-20
 * @author vivaxy
 */
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from 'prosemirror-schema-basic';
import * as collab from 'prosemirror-collab';
import { DOMParser } from 'prosemirror-model';
import Authority from './js/authority.js';

function collabEditor(authority, place) {
  let view = new EditorView(place, {
    state: EditorState.create({
      doc: authority.doc,
      plugins: [collab.collab({ version: authority.steps.length })],
    }),
    dispatchTransaction(transaction) {
      let newState = view.state.apply(transaction);
      view.updateState(newState);
      let sendable = collab.sendableSteps(newState);
      if (sendable) {
        authority.receiveSteps(
          sendable.version,
          sendable.steps,
          sendable.clientID,
        );
      }
    },
  });

  authority.onNewSteps.push(function () {
    let newData = authority.stepsSince(collab.getVersion(view.state));
    view.dispatch(
      collab.receiveTransaction(view.state, newData.steps, newData.clientIDs),
    );
  });

  return view;
}

const doc = DOMParser.fromSchema(schema).parse(
  document.querySelector('#content'),
);

const authority = new Authority(doc);
const view = collabEditor(authority, document.querySelector('#editor'));
