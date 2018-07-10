/**
 * @since 20180710 14:27
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';
import * as updateTypes from '../enums/upgrade-types.js';

function init(events) {

  events.on(eventTypes.APPLY_OPEN_DB, applyOpenDB);

  const STORAGE_KEY = 'idb-demo-version';

  let version = Number(localStorage.getItem(STORAGE_KEY)) || 1;

  function applyOpenDB(eventId, eventData) {

    if (eventData.upgradeType !== updateTypes.INIT) {
      version++;
      localStorage.setItem(STORAGE_KEY, String(version));
    }

    eventData.version = version;
    eventData.name = 'idb-demo';

    events.emit(eventTypes.ON_OPEN_DB_PREPARED, eventData);
  }

}

export default { init };
