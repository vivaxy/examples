/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

function withGC() {
  const doc = new Y.Doc();
  doc.gc = false;
  const text = doc.getText(TEXT_KEY);
  text.insert(0, 'ABC');
  text.delete(1, 1);
  console.log('text', text);
}

function withoutGC() {
  const doc = new Y.Doc();
  const text = doc.getText(TEXT_KEY);
  text.insert(0, 'ABC');
  text.delete(1, 1);
  console.log('text', text);
}

withGC();
withoutGC();
