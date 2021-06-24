/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import createDoc from '../components/doc.js';

function init(e) {
  const $dataList = [];

  const $docContainer = document.getElementById('doc-container');

  function onDocChange(change) {
    e.emit(E.DOC_CHANGE, change);
  }

  function onOpenANewDoc() {
    const { $data } = createDoc($docContainer, onDocChange);
    $dataList.push($data);
  }

  function onYDocChange({ id, doc, change }) {
    console.log(id, doc, change);
  }

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
  e.on(E.Y_DOC_CHANGE, onYDocChange);
}

export default { init };
