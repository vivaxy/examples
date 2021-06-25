/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';
import renderDocContainer from '../components/doc-container.js';
import renderYDocData from '../components/y-doc-data.js';
import * as Y_DOC_KEYS from '../enums/y-doc-keys.js';

function init(e) {
  const $dataList = [];
  const updateEditorList = [];

  const $docContainer = document.getElementById('doc-container');

  function onDocChange(change) {
    e.emit(E.DOC_CHANGE, change);
  }

  function onDocClose(id) {
    $dataList[id] = null;
    updateEditorList[id] = null;
    $docContainer.childNodes[id].remove();
    e.emit(E.DOC_CLOSE, id);
  }

  function onOpenANewDoc() {
    const { $data, updateEditor } = renderDocContainer(
      $docContainer,
      onDocChange,
      onDocClose,
    );
    $dataList.push($data);
    updateEditorList.push(updateEditor);
  }

  function onYDocChange({ id, yDoc }) {
    const updateEditor = updateEditorList[id];
    updateEditor(yDoc.getText(Y_DOC_KEYS.TEXT_KEY).toString());
    const $data = $dataList[id];
    renderYDocData($data, yDoc);
  }

  e.on(E.OPEN_A_NEW_DOC, onOpenANewDoc);
  e.on(E.Y_DOC_CHANGE, onYDocChange);
}

export default { init };
