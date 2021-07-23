/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const TEXT_KEY = 'text-key';
const XML_TEXT_KEY = 'xml-text-key';

const doc = new Y.Doc();

function applyDelta(type) {
  type.insert(0, 'ABC');
  type.applyDelta([{ retain: 1 }, { retain: 1, attributes: { bold: {} } }]);
}

const text = doc.getText(TEXT_KEY);
applyDelta(text);
console.log('text', text.toString());

const xmlText = doc.get(XML_TEXT_KEY, Y.XmlText);
applyDelta(xmlText);
console.log('xmlText', xmlText.toString());
