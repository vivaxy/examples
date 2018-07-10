/**
 * @since 20180710 14:17
 * @author vivaxy
 */

import * as eventTypes from '../enums/event-types.js';

function init(events) {
  events.on(eventTypes.ON_OPEN_DB_PREPARED, onOpenDBPrepared);

  const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

  let db = null;

  function onOpenDBPrepared(eventId, eventData) {

    if (db) {
      db.close();
    }

    const openRequest = indexedDB.open(eventData.name, eventData.version);

    openRequest.addEventListener('error', onError);
    openRequest.addEventListener('success', onSuccess);
    openRequest.addEventListener('upgradeneeded', onUpgradeNeeded);
    openRequest.addEventListener('blocked', onBlocked);

    function onError(e) {
      events.emit(eventTypes.ON_IDB_OPEN_ERROR, e);
    }

    function onSuccess(e) {
      db = e.target.result;
      eventData.db = db;
      eventData.openTransaction = e.target.transaction;
      events.emit(eventTypes.ON_IDB_OPEN_SUCCESS, eventData);
    }

    function onUpgradeNeeded(e) {
      db = e.target.result;
      eventData.db = db;
      eventData.openTransaction = e.target.transaction;
      events.emit(eventTypes.ON_IDB_OPEN_UPGRADE_NEEDED, eventData);
    }

    function onBlocked(e) {
      events.emit(eventTypes.ON_IDB_OPEN_BLOCKED, e);
    }
  }
}

export default { init };
