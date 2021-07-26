/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const doc = new Y.Doc();

const xmlText = doc.get('some-text', Y.XmlText);
xmlText.applyDelta([
  { insert: 'A', attributes: { em: {}, strong: {} } },
  { insert: 'B', attributes: { em: {} } },
  { insert: 'C', attributes: { em: {}, strong: {} } },
]);
console.log(xmlText.toString());
// should be <em><strong>A</strong></em><em>B</em><em><strong>C</strong></em>
