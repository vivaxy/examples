/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';

const SAMPLE_KEY = 'sample_key';

function logContent(content) {
  if (content.str) {
    return `STR(${content.str})`;
  }
  if (content.len) {
    return `DEL(${content.len})`;
  }
  throw new Error('Unexpected content');
}

function logSharedType(sharedType) {
  let item = sharedType._start;
  const output = [];
  while (item) {
    const content = logContent(item.content);
    output.push(`${item.id.clock}|${content}`);
    item = item.right;
  }
  return output;
}

function logOperationWithSharedType(operation, sharedType) {
  console.log(`${operation}:`, logSharedType(sharedType));
}

function logDoc(doc) {
  const res = {};
  doc.store.clients.forEach(function (items, clientId) {
    res[clientId] = logSharedType(items[0].parent);
  });
  return res;
}

function logOperationWithDoc(operation, doc) {
  console.log(`${operation}:`, logDoc(doc));
}

/**
 * Single Doc Scenario
 */
const docA = new Y.Doc();
const textA = docA.getText(SAMPLE_KEY);
logOperationWithSharedType('getText, textA', textA);
textA.insert(0, 'A');
logOperationWithSharedType('insert 0 A, textA', textA);
textA.insert(1, 'BC');
logOperationWithSharedType('insert 1 BC, textA', textA);
textA.delete(1, 1);
logOperationWithSharedType('delete 1 1, textA', textA);
textA.insert(1, 'T');
logOperationWithSharedType('insert 1 T, textA', textA);
textA.insert(0, 'X');
logOperationWithSharedType('insert 0 X, textA', textA);

/**
 * 2 Docs Scenario Without Conflicts
 */
const docB = new Y.Doc();
const textB = docB.getText(SAMPLE_KEY);
logOperationWithDoc('getText from docB, docA', docA);
logOperationWithDoc('getText from docB, docB', docB);
Y.applyUpdate(docB, Y.encodeStateAsUpdate(docA));
logOperationWithDoc('sync docA to docB, docA', docA);
logOperationWithDoc('sync docA to docB, docB', docB);
textB.delete(1, 1);
logOperationWithDoc('delete 1 1 in docB, docA', docA);
logOperationWithDoc('delete 1 1 in docB, docB', docB);
textB.insert(1, 'T');
logOperationWithDoc('insert 1 T in docB, docA', docA);
logOperationWithDoc('insert 1 T in docB, docB', docB);
