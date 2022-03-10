/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Schema, Node } from 'prosemirror-model';
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
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: exampleSetup({ schema: schema }),
});

const socket = new ReconnectingWebSocket(`ws://${location.hostname}:8000`);
const connection = new Connection(socket);
const doc = connection.get('doc-collection', 'doc-id');

socket.addEventListener('open', () => {
  console.info('socket open');
});

socket.addEventListener('close', () => {
  console.warn('socket close');
});

doc.subscribe((error) => {
  if (error) {
    return console.error(error);
  }

  // If doc.type is undefined, the document has not been created, so let's create it
  if (!doc.type) {
    doc.create(state.doc.toJSON(), (error) => {
      if (error) {
        console.error(error);
      }
    });
  }
});

doc.on('op', (op, local) => {
  console.log('op', op, local);
  if (!local) {
    const { data } = doc.toSnapshot();
    const pmDoc = Node.fromJSON(schema, data);
    const transform = recreateTransform(view.state.doc, pmDoc, {
      complexSteps: true, // Whether step types other than ReplaceStep are allowed.
      wordDiffs: false, // Whether diffs in text nodes should cover entire words.
      simplifyDiffs: true, // Whether steps should be merged, where possible
    });
    const tr = view.state.tr.setMeta('remote', true);
    transform.steps.forEach((step) => {
      tr.step(step);
    });
    console.log('steps', tr.steps);
    view.dispatch(tr);
  }
});

const view = new EditorView(document.querySelector('#editor'), {
  state,
  dispatchTransaction(tr) {
    if (!tr.getMeta('remote')) {
      const oldJSON = view.state.doc.toJSON();
      const newJSON = tr.doc.toJSON();
      const ops = jsonDiff(oldJSON, newJSON);
      ops.forEach((op) => {
        doc.submitOp(op);
      });
    }
    const newState = view.state.apply(tr);
    view.updateState(newState);
  },
});

window.view = view;
