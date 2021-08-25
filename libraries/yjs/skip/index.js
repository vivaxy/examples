/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';
import decodeUpdate from '../data-visualization/src/update-decoder';

const TEXT_KEY = 'text';

const updates = [];
const yDoc = new Y.Doc();
yDoc.on('update', function (update) {
  updates.push(update);
});
const yText = yDoc.get(TEXT_KEY, Y.Text);
yText.insert(0, 'A');
yText.insert(1, 'B');
yText.insert(2, 'C');
console.log(
  'merge 2 updates',
  decodeUpdate(updates[0]),
  decodeUpdate(updates[2]),
);
const mergedUpdate = Y.mergeUpdates([updates[0], updates[2]]);
console.log('mergedUpdate', decodeUpdate(mergedUpdate));

const appliedYDoc = new Y.Doc();
appliedYDoc.get(TEXT_KEY, Y.Text);
Y.applyUpdate(appliedYDoc, mergedUpdate);
console.log('appliedYDoc', toJSON(appliedYDoc, Y));
