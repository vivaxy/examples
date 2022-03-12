/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema, Node } from 'prosemirror-model';
import { addListNodes } from 'prosemirror-schema-list';
import { exampleSetup } from 'prosemirror-example-setup';
import ReconnectingWebSocket from 'reconnecting-websocket';
import { Connection } from 'sharedb/lib/client';
import jsonDiff from 'json0-ot-diff';
import { recreateTransform } from '@technik-sde/prosemirror-recreate-transform';

const schema = new Schema({
  nodes: addListNodes(basicSchema.spec.nodes, 'paragraph block*', 'block'),
  marks: basicSchema.spec.marks,
});

const state = EditorState.create({
  schema,
  plugins: exampleSetup({ schema: schema }),
});

const socket = new ReconnectingWebSocket(`ws://${location.hostname}:8000`);
const connection = new Connection(socket);
const shareDBDoc = connection.get('doc-collection', 'doc-id');

socket.addEventListener('open', () => {
  console.info('[socket] open');
});

socket.addEventListener('close', () => {
  console.warn('[socket] close');
});

shareDBDoc.subscribe((error) => {
  if (error) {
    return console.error(error);
  }

  // If doc.type is undefined, the document has not been created, so let's create it
  if (!shareDBDoc.type) {
    shareDBDoc.create(state.doc.toJSON(), (error) => {
      if (error) {
        console.error(error);
      }
    });
  }
  shareDBToProseMirror();
  console.log('loading end');
});

shareDBDoc.on('op batch', (op, local) => {
  console.log(`${local ? 'Local' : 'Remote'}-op batch`, op);
  if (!local) {
    shareDBToProseMirror();
  }
});

function shareDBToProseMirror() {
  const { data } = shareDBDoc.toSnapshot();
  console.log('shareDBDoc', data);
  const pmDoc = Node.fromJSON(schema, data);
  const transform = recreateTransform(view.state.doc, pmDoc, {
    complexSteps: true, // Whether step types other than ReplaceStep are allowed.
    wordDiffs: false, // Whether diffs in text nodes should cover entire words.
    simplifyDiffs: true, // Whether steps should be merged, where possible
  });
  const tr = view.state.tr
    .setMeta('addToHistory', false)
    .setMeta('shareDB', true);
  transform.steps.forEach((step) => {
    tr.step(step);
  });
  console.log(
    'Remote-steps',
    tr.steps.map((step) => {
      return step.toJSON();
    }),
  );
  view.dispatch(tr);
}

function proseMirrorToShareDB(pmDoc = view.state.doc) {
  const oldJSON = view.state.doc.toJSON();
  const newJSON = pmDoc.toJSON();
  const ops = jsonDiff(oldJSON, newJSON);
  ops.forEach((op) => {
    shareDBDoc.submitOp(op);
  });
  console.log('shareDBDoc', shareDBDoc.toSnapshot().data);
}

const view = new EditorView(document.querySelector('#editor'), {
  state,
  dispatchTransaction(tr) {
    if (!tr.getMeta('shareDB')) {
      proseMirrorToShareDB(tr.doc);
    }
    const newState = view.state.apply(tr);
    view.updateState(newState);
  },
});

window.view = view;

const $connection = document.getElementById('connection');
$connection.addEventListener('click', () => {
  if ($connection.textContent === 'Disconnect') {
    shareDBDoc.pause();
    shareDBDoc.unsubscribe((error) => {
      if (error) {
        console.error('unsubscribe', error);
      }
    });
    $connection.textContent = 'Connect';
  } else {
    shareDBDoc.resume();
    shareDBDoc.subscribe((error) => {
      if (error) {
        console.error('subscribe', error);
      }
    });
    $connection.textContent = 'Disconnect';
  }
});
