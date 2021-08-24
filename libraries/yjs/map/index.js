/**
 * @since 2021-08-03
 * @author vivaxy
 */
import * as Y from 'yjs';
import { toJSON } from '../data-visualization/src/data-viewer';

const MAP_KEY = 'key';

const yDoc = new Y.Doc();
const map = yDoc.getMap('my-map');
map.set(MAP_KEY, 1);
map.set(MAP_KEY, 2);
console.log(toJSON(yDoc, Y));
console.log('delete');
map.delete(MAP_KEY);
console.log(toJSON(yDoc, Y));
