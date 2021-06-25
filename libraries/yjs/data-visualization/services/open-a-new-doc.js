/**
 * @since 2021-06-24
 * @author vivaxy
 */
import * as E from '../enums/event-types.js';

function init(e) {
  const $openANewDoc = document.getElementById('open-a-new-doc');
  $openANewDoc.addEventListener('click', function () {
    e.emit(E.OPEN_A_NEW_DOC);
  });
}

export default { init };
