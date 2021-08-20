/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON, DATA_TYPES } from '../data-visualization/src/data-viewer';

const TEXT_KEY = 'text';

const errors = {
  unexpectedType(type) {
    return new Error('Unexpected type: ' + type);
  },
};

function printText(doc, message = '') {
  const xmlText = doc.get(TEXT_KEY, Y.XmlText);
  const json = toJSON(xmlText, Y);
  console.log(
    message,
    json.xmlText
      .map(function (item) {
        if (item.content.type === DATA_TYPES.CONTENT_FORMAT) {
          if (item.content.value === null) {
            return `</${item.content.key}>`;
          }
          const attrs = Object.keys(item.content.value)
            .map(function (key) {
              return `${key}="${item.content.value[key]}"`;
            })
            .join(' ');
          return `<${item.content.key} ${attrs}>`;
        }
        if (item.content.type === DATA_TYPES.CONTENT_STRING) {
          return `${item.content.string}`;
        }
        if (item.content.type === DATA_TYPES.CONTENT_DELETED) {
          return `<ContentDeleted />`;
        }
        throw errors.unexpectedType(item.content.type);
      })
      .join(' -> '),
  );
}

function localConflict() {
  const doc = new Y.Doc();

  const xmlText = doc.get(TEXT_KEY, Y.XmlText);
  xmlText.applyDelta([{ insert: 'ABC' }]);
  xmlText.applyDelta([
    { retain: 2, attributes: { color: { color: 'red' } } },
    { retain: 1 },
  ]);
  xmlText.applyDelta([
    { retain: 1 },
    { retain: 2, attributes: { color: { color: 'blue' } } },
  ]);
  printText(doc);
  // actual is <color color="red"> -> A -> <color color="blue"> -> B -> <ContentDeleted /> -> C -> </color>
  // should be <color color="red"> -> A -> <color color="blue"> -> B -> </color> -> C -> </color>
}

function remoteConflict() {
  const doc1 = new Y.Doc();
  const xmlText1 = doc1.get(TEXT_KEY, Y.XmlText);
  xmlText1.insert(0, 'ABC');
  printText(doc1, 'doc1:');
  // ABC

  const doc2 = new Y.Doc();
  const xmlText2 = doc2.get(TEXT_KEY, Y.XmlText);
  Y.applyUpdate(doc2, Y.encodeStateAsUpdate(doc1));

  xmlText1.applyDelta([
    { retain: 2, attributes: { color: { color: 'red' } } },
    { retain: 1 },
  ]);
  // <color color="red" id="1_3"> -> AB -> </color> -> C

  xmlText2.applyDelta([
    { retain: 1 },
    { retain: 2, attributes: { color: { color: 'blue' } } },
  ]);
  // A -> <color color="blue" id="2_0"> -> BC -> </color>

  Y.applyUpdate(doc1, Y.encodeStateAsUpdate(doc2));
  printText(doc1, 'doc1:');
  // actual is <color color="red"> -> A -> <color color="blue"> -> B -> </color> -> C -> </color>
  // should be <color color="red" id="1_3"> -> A -> <color color="blue" id="2_0"> -> B -> </color id="1_3"> -> C -> </color id="2_0">

  xmlText1.applyDelta([
    { retain: 1 },
    { retain: 2, attributes: { color: { color: 'blue' } } },
  ]);
  console.log(xmlText1.toString());
  printText(doc1, 'doc1:');
}

localConflict();
remoteConflict();
