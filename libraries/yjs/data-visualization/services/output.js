/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import createDoc from '../components/doc.js';

function init(e) {
  const $docContainer = document.getElementById('doc-container');

  function onDocChange(change) {
    console.log('change', change);
  }

  function onOpenANewDoc() {
    createDoc($docContainer, onDocChange);
  }

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
}

export default { init };
