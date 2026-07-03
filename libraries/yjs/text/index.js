import * as Y from 'yjs';

const TEXT_KEY = 'text-key';

const docA = new Y.Doc();
const textA = docA.getText(TEXT_KEY);
textA.insert(0, 'A');
textA.insert(1, 'BC');
textA.delete(1, 1);
textA.insert(1, 'T');
textA.insert(0, 'X');
console.log('textA', textA.toString());
