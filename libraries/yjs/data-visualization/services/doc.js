/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as Y from '//esm.run/yjs';
import * as E from '../enums/event-types.js';
import createDoc from '../components/doc.js';

function init(e) {
  e.on(E.OPEN_A_NEW_DOC, function () {});
}

export default { init };
