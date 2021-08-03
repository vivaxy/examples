/**
 * @since 2021-08-03
 * @author vivaxy
 */
import * as Y from 'yjs';

const MAP_KEY = 'key';

const yDoc = new Y.Doc();
const map = yDoc.getMap('my-map');
map.set(MAP_KEY, 1);
map.set(MAP_KEY, 2);
map.delete(MAP_KEY);
console.log(map);
