/**
 * @since 2024-12-11
 * @author vivaxy
 */
import { EditorView, basicSetup } from 'codemirror';
import { conventionalCommits } from './language';

let editor = new EditorView({
  doc: 'feat(test): ok',
  extensions: [basicSetup, conventionalCommits()],
  parent: document.getElementById('root'),
});
