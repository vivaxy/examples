/**
 * @since 2024-12-11
 * @author vivaxy
 */
import { EditorView, basicSetup } from 'codemirror';
import { javascript } from '@codemirror/lang-javascript';

let editor = new EditorView({
  doc: 'const a = 1;\nfunction test () {\n  \n}',
  extensions: [basicSetup, javascript()],
  parent: document.getElementById('root'),
});
