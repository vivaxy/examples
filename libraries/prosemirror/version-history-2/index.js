/**
 * @since 2021-03-26 16:27
 * @author vivaxy
 */
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { DOMParser } from 'prosemirror-model';
import { exampleSetup } from 'prosemirror-example-setup';
import { trackPlugin, highlightPlugin, history } from './history';

const initialState = EditorState.create({
  schema,
  doc: DOMParser.fromSchema(schema).parse(document.querySelector('#content')),
  plugins: [...exampleSetup({ schema }), trackPlugin, highlightPlugin],
});

const view = new EditorView(document.querySelector('#editor'), {
  state: initialState,
});
window.view = view;

let commitId = 0;

const $commit = document.querySelector('#commit');
$commit.addEventListener('click', function (e) {
  e.preventDefault();
  const commitMessage =
    document.querySelector('#commit-message').value || 'No message';
  const transaction = view.state.tr.setMeta(trackPlugin, commitMessage);
  view.dispatch(transaction);

  appendCommit(commitId++, commitMessage);
});

const $commits = document.querySelector('#commits');

function createShowHistory(commitId) {
  return function showHistory() {
    const newState = history.createEditorStateByCommitId(commitId, view);
    const $diffRoot = document.querySelector('#diff');
    const diffEditor = new EditorView($diffRoot, {
      state: newState,
    });
    const html = diffEditor.dom.innerHTML;
    diffEditor.destroy();
    $diffRoot.innerHTML = html;
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
