/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

function getByteLengthForUpdate(arrayBuffer) {
  return arrayBuffer.byteLength;
}

function getByteLengthForText(text) {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(text);
  return encoded.byteLength;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function sameClientAddText(gc = false) {
  const doc = new Y.Doc();
  doc.gc = gc;
  const xmlFragment = doc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);

  const data = [];
  let textSize = 0;

  for (let i = 0; i < 11; i++) {
    const update = Y.encodeStateAsUpdate(doc);
    const updateSize = getByteLengthForUpdate(update);
    data.push({ textSize, updateSize });

    const text = chars.repeat(100);
    xmlText.insert(0, text);
    textSize += getByteLengthForText(text);
  }

  console.table(data);
  return doc;
}

function sameClientDelete(gc = false, seq = false) {
  const doc = new Y.Doc();
  doc.gc = gc;
  doc.clientId = 0;
  const xmlFragment = doc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);
  const text = chars.repeat(100);
  xmlText.insert(0, text);

  const data = [];
  let deleteSize = 0;

  for (let i = 0; i < 11; i++) {
    const update = Y.encodeStateAsUpdate(doc);
    const updateSize = getByteLengthForUpdate(update);
    data.push({ deleteSize, updateSize });

    for (let j = 0; j < 100; j++) {
      xmlText.delete(seq ? 0 : 1, 1);
      deleteSize += getByteLengthForText(text[0]);
    }
  }

  console.table(data);
  return doc;
}

function clientsEdit(gc = false) {
  const serverDoc = new Y.Doc();
  serverDoc.gc = gc;
  const xmlFragment = serverDoc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);

  const data = [];
  let clientCount = 0;
  let textSize = 0;
  for (let i = 0; i < 11; i++) {
    const updateSize = getByteLengthForUpdate(Y.encodeStateAsUpdate(serverDoc));
    data.push({
      clientCount,
      updateSize,
      textSize,
      otherSize: updateSize - textSize,
    });

    for (let j = 0; j < 10; j++) {
      const clientDoc = new Y.Doc();
      Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverDoc));
      const xmlFragment = clientDoc.getXmlFragment('html');
      const xmlText = xmlFragment.get(0);
      xmlText.insert(0, chars);
      textSize += getByteLengthForText(chars);
      const update = Y.encodeStateAsUpdate(clientDoc);
      Y.applyUpdate(serverDoc, update);
      clientCount++;
    }
  }
  console.table(data);
}

sameClientAddText(true);
sameClientAddText(false);
sameClientDelete(true, true);
sameClientDelete(false, true);
sameClientDelete(true, false);
sameClientDelete(false, false);
clientsEdit();
