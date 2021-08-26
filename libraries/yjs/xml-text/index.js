/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';

const TEXT_KEY = 'text-key';
const XML_TEXT_KEY = 'xml-text-key';

function differenceBetweenTextAndXmlText() {
  function applyDelta(type) {
    type.insert(0, 'ABC');
    type.applyDelta([{ retain: 1 }, { retain: 1, attributes: { bold: {} } }]);
  }

  const doc = new Y.Doc();
  const text = doc.getText(TEXT_KEY);
  applyDelta(text);
  console.log('text', text.toString());

  const xmlText = doc.get(XML_TEXT_KEY, Y.XmlText);
  applyDelta(xmlText);
  console.log('xmlText', xmlText.toString());
}

function applyWithSameAttributes() {
  const doc = new Y.Doc();
  const xmlText = doc.getText(XML_TEXT_KEY);
  xmlText.insert(0, 'AB');
  xmlText.applyDelta([
    { retain: 1, attributes: { bold: true } },
    { retain: 1, attributes: { bold: true } },
  ]);
  console.log('applyWithSameAttributes', toJSON(xmlText, Y));
}

differenceBetweenTextAndXmlText();
applyWithSameAttributes();
