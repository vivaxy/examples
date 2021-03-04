/**
 * @since 2021-03-04 10:43
 * @author vivaxy
 * @reference https://web.dev/nfc/
 */
function checkNFCCompatible() {
  if (!('NDEFReader' in window)) {
    throw new Error('NFC not supported.');
  }
}

async function checkNFCPermission() {
  const nfcPermissionStatus = await navigator.permissions.query({
    name: 'nfc',
  });
  if (nfcPermissionStatus.state !== 'granted') {
    throw new Error('NFC permission not granted.');
  }
}

function scan(abortController) {
  return new Promise(function (resolve, reject) {
    ndef
      .scan({ signal: abortController.signal })
      .then(function () {
        console.log('Scan started successfully.');
        ndef.addEventListener('readingerror', reject);
        ndef.addEventListener('reading', resolve);
      })
      .catch(reject);
  });
}

let abortController = null;

function handleNFCReadingEvent(event) {
  console.log('NDEF message read.');
  console.log('event.serialNumber: ', event.serialNumber);
  console.log('event.message: ', event.message);

  for (const record of event.message.records) {
    console.log('record:', record);
    console.log('record.recordType:', record.recordType);
    console.log('record.mediaType :', record.mediaType);
    console.log('record.id        :', record.id);
    switch (record.recordType) {
      case 'text':
        readTextRecord(record);
        break;
      case 'url':
        readUrlRecord(record);
        break;
      case 'mime':
        readMimeRecord(record);
        break;
      case 'absolute-url':
        readAbsoluteUrlRecord(record);
        break;
      case 'smart-poster':
        readAbsoluteUrlRecord(record);
        break;
      case 'empty':
        readEmptyRecord(record);
        break;
      default:
        console.error('Unhandled recordType:', record.recordType);
    }
  }
}

function readTextRecord(record) {
  console.assert(record.recordType === 'text');
  const textDecoder = new TextDecoder(record.encoding);
  console.log(`Text: ${textDecoder.decode(record.data)} (${record.lang})`);
}

function readUrlRecord(record) {
  console.assert(record.recordType === 'url');
  const textDecoder = new TextDecoder();
  console.log(`URL: ${textDecoder.decode(record.data)}`);
}

function readMimeRecord(record) {
  console.assert(record.recordType === 'mime');
  if (record.mediaType === 'application/json') {
    const textDecoder = new TextDecoder();
    console.log(`JSON: ${JSON.parse(decoder.decode(record.data))}`);
  } else if (record.mediaType.startsWith('image/')) {
    const blob = new Blob([record.data], { type: record.mediaType });
    const img = new Image();
    img.src = URL.createObjectURL(blob);
    document.body.appendChild(img);
  } else {
    console.error('Unhandled mediaType:', record.mediaType);
  }
}

function readAbsoluteUrlRecord(record) {
  console.assert(record.recordType === 'absolute-url');
  const textDecoder = new TextDecoder();
  console.log(`Absolute URL: ${textDecoder.decode(record.data)}`);
}

function readSmartPosterRecord(smartPosterRecord) {
  console.assert(smartPosterRecord.recordType === 'smart-poster');
  let action, text, url;

  for (const record of smartPosterRecord.toRecords()) {
    if (record.recordType == 'text') {
      const decoder = new TextDecoder(record.encoding);
      text = decoder.decode(record.data);
    } else if (record.recordType == 'url') {
      const decoder = new TextDecoder();
      url = decoder.decode(record.data);
    } else if (record.recordType == ':act') {
      action = record.data.getUint8(0);
    } else {
      console.error('Unhandled SmartPoster recordType:', record.recordType);
    }
  }
  console.log(`SmartPoster: action: ${action}, text: ${text}, url: ${url}`);
}

function readExternalTypeRecord(externalTypeRecord) {
  for (const record of externalTypeRecord.toRecords()) {
    if (record.recordType == 'text') {
      const decoder = new TextDecoder(record.encoding);
      console.log(`Text: ${textDecoder.decode(record.data)} (${record.lang})`);
    } else if (record.recordType == 'url') {
      const decoder = new TextDecoder();
      console.log(`URL: ${decoder.decode(record.data)}`);
    } else {
      console.error('Unhandled recordType');
    }
  }
}

function readEmptyRecord(record) {
  console.log('Empty Record');
}

async function readNFC() {
  try {
    if (abortController) {
      return;
    }
    abortController = new AbortController();
    checkNFCCompatible();
    await checkNFCPermission();
    const ndef = new NDEFReader();
    const nfcReadingEvent = await scan(abortController);
    handleNFCReadingEvent(nfcReadingEvent);
  } catch (e) {
    console.log('Failed with error:', e);
    abortController = null;
  }
}

function abortScanNFC() {
  if (!abortController) {
    return;
  }
  abortController.abort();
}

document.getElementById('#read-nfc').addEventListener('click', readNFC);
document
  .getElementById('#abort-read-nfc')
  .addEventListener('click', abortReadNFC);
