/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

function getByteLengthForUpdate(arrayBuffer) {
  return arrayBuffer.byteLength;
}

function getByteLengthForText(text) {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(text);
  return encoded.byteLength;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function sameClientAddText(pud = false, gc = false) {
  const doc = new Y.Doc();
  doc.gc = gc;

  if (pud) {
    const permanentUserData = new Y.PermanentUserData(doc);
    permanentUserData.setUserMapping(doc, doc.clientID, 'test-user-name');
  }

  const xmlFragment = doc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);

  const data = [];
  let textBytes = 0;

  for (let i = 0; i < 11; i++) {
    const update = Y.encodeStateAsUpdate(doc);
    const updateBytes = getByteLengthForUpdate(update);
    data.push({ textBytes, updateBytes });

    const text = chars.repeat(100);
    xmlText.insert(0, text);
    if (pud) {
      await sleep();
    }
    textBytes += getByteLengthForText(text);
  }

  console.table(data);
  return doc;
}

async function sameClientDelete(seq = false, pud = false, gc = false) {
  const doc = new Y.Doc();
  doc.gc = gc;

  if (pud) {
    const permanentUserData = new Y.PermanentUserData(doc);
    permanentUserData.setUserMapping(doc, doc.clientID, 'test-user-name');
  }

  const xmlFragment = doc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);
  const text = chars.repeat(100);
  xmlText.insert(0, text);
  if (pud) {
    await sleep();
  }

  const data = [];
  let deletedBytes = 0;

  for (let i = 0; i < 11; i++) {
    const update = Y.encodeStateAsUpdate(doc);
    const updateBytes = getByteLengthForUpdate(update);
    data.push({ deletedBytes, updateBytes });

    const deleteSteps = 100;
    for (let j = 0; j < deleteSteps; j++) {
      xmlText.delete(seq ? 0 : i * deleteSteps + j, 1);
      deletedBytes += getByteLengthForText(text[0]);
    }
    if (pud) {
      await sleep();
    }
  }

  console.table(data);
  return doc;
}

async function clientsEdit(pud = false, gc = false) {
  const serverDoc = new Y.Doc();
  serverDoc.gc = gc;

  const xmlFragment = serverDoc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);

  const data = [];
  let clientsCount = 0;
  let textBytes = 0;
  for (let i = 0; i < 11; i++) {
    const updateBytes = getByteLengthForUpdate(
      Y.encodeStateAsUpdate(serverDoc),
    );
    data.push({
      clientsCount,
      updateBytes,
      textBytes,
      otherBytes: updateBytes - textBytes,
    });

    for (let j = 0; j < 10; j++) {
      const clientDoc = new Y.Doc();

      if (pud) {
        const permanentUserData = new Y.PermanentUserData(clientDoc);
        permanentUserData.setUserMapping(
          clientDoc,
          clientDoc.clientID,
          'test-user-name',
        );
      }

      Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverDoc));
      const xmlFragment = clientDoc.getXmlFragment('html');
      const xmlText = xmlFragment.get(0);
      xmlText.insert(0, chars);

      if (pud) {
        await sleep();
      }

      textBytes += getByteLengthForText(chars);
      const update = Y.encodeStateAsUpdate(clientDoc);
      Y.applyUpdate(serverDoc, update);
      clientsCount++;
    }
  }

  console.table(data);
}

const tests = {
  async 'textBytes -> updateBytes (w & w/o gc)'() {
    await sameClientAddText(false, false);
    await sameClientAddText(false, true);
  },
  async 'textBytes -> updateBytes(w & w/o pud)'() {
    await sameClientAddText(false);
    await sameClientAddText(true);
  },
  async 'deletedBytes -> updateBytes (w & w/o gc)'() {
    await sameClientDelete(true, false);
    await sameClientDelete(true, true);
  },
  async 'deletedBytes -> updateBytes (w & w/o sequence deletion)'() {
    await sameClientDelete(true);
    await sameClientDelete(false);
  },
  async 'clientsCount -> updateBytes'() {
    await clientsEdit();
  },
  async 'clientsCount -> updateBytes (w & w/o pud)'() {
    await clientsEdit(false);
    await clientsEdit(true);
  },
  async 'deletedBytes -> updateBytes (w & w/o pud)'() {
    await sameClientDelete(false, false);
    await sameClientDelete(false, true);
  },
};

Object.keys(tests).forEach(function (name) {
  const button = document.createElement('button');
  button.textContent = name;
  button.addEventListener('click', tests[name]);
  document.body.appendChild(button);

  const br = document.createElement('br');
  document.body.appendChild(br);
});
