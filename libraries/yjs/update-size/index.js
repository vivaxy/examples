/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

let userId = 0;

function generateUserDescription() {
  return `user-name-${userId++}`;
}

function sleep(timeout) {
  return new Promise(function (resolve) {
    setTimeout(resolve, timeout);
  });
}

function getByteLengthForUpdate(arrayBuffer) {
  return arrayBuffer.byteLength;
}

function getByteLengthForYDoc(yDoc) {
  const update = Y.encodeStateAsUpdate(yDoc);
  return getByteLengthForUpdate(update);
}

function getByteLengthForText(text) {
  const textEncoder = new TextEncoder();
  const encoded = textEncoder.encode(text);
  return encoded.byteLength;
}

function getItemsCount(yDoc) {
  return Array.from(yDoc.store.clients.entries()).reduce(function (
    acc,
    [_, items],
  ) {
    return acc + items.length;
  },
  0);
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

async function diffDocs(getBeforeDoc, getAfterDoc) {
  const beforeDoc = await getBeforeDoc();
  const afterDoc = await getAfterDoc(Y.encodeStateAsUpdate(beforeDoc));

  console.log('itemsCount', getItemsCount(afterDoc) - getItemsCount(beforeDoc));
  console.log(
    'bytes',
    getByteLengthForYDoc(afterDoc) - getByteLengthForYDoc(beforeDoc),
  );
}

async function sameClientInsert({ pud = false, gc = false, seq = false } = {}) {
  const yDoc = new Y.Doc();
  yDoc.gc = gc;

  if (pud) {
    const permanentUserData = new Y.PermanentUserData(yDoc);
    permanentUserData.setUserMapping(
      yDoc,
      yDoc.clientID,
      generateUserDescription(),
    );
  }

  const data = [];
  let textBytes = 0;

  const xmlFragment = yDoc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);
  xmlText.insert(0, 'A');
  pud && (await sleep());

  const updateBytes = getByteLengthForYDoc(yDoc);
  const itemsCount = getItemsCount(yDoc);
  data.push({ textBytes, itemsCount, updateBytes });

  for (let i = 0; i < 10; i++) {
    const text = 'A';
    let insertPos = 0;
    if (seq) {
      insertPos = xmlText.toString().length;
    }
    xmlText.insert(insertPos, text);
    pud && (await sleep());

    textBytes += getByteLengthForText(text);
    const updateBytes = getByteLengthForYDoc(yDoc);
    const itemsCount = getItemsCount(yDoc);
    data.push({ textBytes, itemsCount, updateBytes });
  }

  console.table(data);
  return yDoc;
}

async function sameClientDelete({ seq = false, pud = false, gc = false } = {}) {
  const doc = new Y.Doc();
  doc.gc = gc;

  if (pud) {
    const permanentUserData = new Y.PermanentUserData(doc);
    permanentUserData.setUserMapping(
      doc,
      doc.clientID,
      generateUserDescription(),
    );
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
    const updateBytes = getByteLengthForYDoc(doc);
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

async function clientsEdit({ pud = false, gc = false } = {}) {
  const serverDoc = new Y.Doc();
  serverDoc.gc = gc;

  const xmlFragment = serverDoc.getXmlFragment('html');
  const xmlText = new Y.XmlText();
  xmlFragment.insert(0, [xmlText]);

  const data = [];
  let clientsCount = 0;
  let textBytes = 0;
  for (let i = 0; i < 11; i++) {
    const updateBytes = getByteLengthForYDoc(serverDoc);
    data.push({
      clientsCount,
      updateBytes,
      textBytes,
      otherBytes: updateBytes - textBytes,
    });

    for (let j = 0; j < 10; j++) {
      const clientDoc = new Y.Doc();
      Y.applyUpdate(clientDoc, Y.encodeStateAsUpdate(serverDoc));

      if (pud) {
        const permanentUserData = new Y.PermanentUserData(clientDoc);
        permanentUserData.setUserMapping(
          clientDoc,
          clientDoc.clientID,
          generateUserDescription(),
        );
      }

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
  async 'add xmlFragment'() {
    async function getBeforeDoc() {
      const yDoc = new Y.Doc();
      const html = yDoc.getXmlFragment('prosemirror');
      return yDoc;
    }

    async function getAfterDoc(update) {
      const yDoc = new Y.Doc();
      Y.applyUpdate(yDoc, update);
      const html = yDoc.getXmlFragment('prosemirror');
      return yDoc;
    }

    await diffDocs(getBeforeDoc, getAfterDoc);
  },
  async 'add pud'() {
    async function getBeforeDoc() {
      const yDoc = new Y.Doc();
      return yDoc;
    }

    async function getAfterDoc(update) {
      const yDoc = new Y.Doc();
      Y.applyUpdate(yDoc, update);

      const permanentUserData = new Y.PermanentUserData(yDoc);
      permanentUserData.setUserMapping(
        yDoc,
        yDoc.clientID,
        generateUserDescription(),
      );

      await sleep();
      return yDoc;
    }

    await diffDocs(getBeforeDoc, getAfterDoc);
  },
  async 'textBytes -> updateBytes (w & w/o gc)'() {
    await sameClientInsert({ gc: true, seq: true });
    await sameClientInsert({ gc: false, seq: true });
  },
  async 'textBytes -> updateBytes(w & w/o pud)'() {
    await sameClientInsert({ pud: true, seq: true });
    await sameClientInsert({ pud: false, seq: true });
  },
  async 'textBytes -> updateBytes(w & w/o seq insertion)'() {
    await sameClientInsert({ seq: true });
    await sameClientInsert({ seq: false });
  },
  async 'deletedBytes -> updateBytes (w & w/o gc)'() {
    await sameClientDelete({ gc: true });
    await sameClientDelete({ gc: false });
  },
  async 'deletedBytes -> updateBytes (w & w/o sequence deletion)'() {
    await sameClientDelete({ seq: true });
    await sameClientDelete({ seq: false });
  },
  async 'clientsCount -> updateBytes'() {
    await clientsEdit();
  },
  async 'clientsCount -> updateBytes (w & w/o pud)'() {
    await clientsEdit({ pud: true });
    await clientsEdit({ pud: false });
  },
  async 'deletedBytes -> updateBytes (w & w/o pud)'() {
    await sameClientDelete({ pud: true });
    await sameClientDelete({ pud: false });
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
