/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

const doc = new Y.Doc();
const text = doc.getText(TEXT_KEY);
text.insert(0, 'A');
console.log('doc', doc, 'text', text);
