/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser, Slice } from 'prosemirror-model';
import { Mapping } from 'prosemirror-transform';
import { trackPlugin, highlightPlugin, CHANGE_TYPES } from './history';

const initialState = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [trackPlugin, highlightPlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state: initialState,
});
window.view = view;

let commitId = 0;

const $commit = document.querySelector('#commit');
$commit.addEventListener('submit', function (e) {
  e.preventDefault();
  const commitMessage = new FormData(e.target).get('message') || 'No message';
  const transaction = view.state.tr.setMeta(trackPlugin, commitMessage);
  const newState = view.state.apply(transaction);
  view.updateState(newState);

  appendCommit(commitId++, commitMessage);
});

const $commits = document.querySelector('#commits');

function createShowHistory(commitId) {
  return function showHistory() {
    const commits = trackPlugin.getState(view.state).commits;
    const commit = commits[commitId];
    const oldState = commit.editorState;
    // we preserve deletions, so steps after deleteStep will rebase upon `remapping`
    const remapping = new Mapping();
    const decorations = [];
    const transaction = oldState.tr;
    commit.transactions.forEach(function (tr) {
      tr.steps.forEach(function (step, i) {
        if (step.slice === Slice.empty) {
          // deletion
          const insertStep = step.invert(tr.docs[i]).map(remapping);
          remapping.appendMap(insertStep.map(remapping).getMap(), null);
          decorations.push({
            from: insertStep.from,
            to: insertStep.to + insertStep.slice.size,
            type: CHANGE_TYPES.DELETE,
          });
        } else {
          // insertion
          const insertStep = step.map(remapping);
          transaction.step(insertStep);
          decorations.push({
            from: insertStep.from,
            to: insertStep.to + insertStep.slice.size,
            type: CHANGE_TYPES.INSERT,
          });
        }
      });
    });
    transaction.setMeta(highlightPlugin, decorations);
    transaction.setMeta(trackPlugin, commits);
    const newState = oldState.apply(transaction);
    view.updateState(newState);
  };
}

function appendCommit(commitId, commitMessage) {
  const $message = document.createElement('span');
  $message.textContent = commitMessage;
  const $button = document.createElement('button');
  $button.textContent = 'Show';
  $button.addEventListener('click', createShowHistory(commitId));

  const $commit = document.createElement('div');
  $commit.classList.add('commit');
  $commit.appendChild($button);
  $commit.appendChild($message);
  $commits.appendChild($commit);
}
