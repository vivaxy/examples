/**
 * @since 20180709 18:58
 * @author vivaxy
 */
import * as eventTypes from '../enums/event-types.js';
import * as upgradeTypes from '../enums/upgrade-types.js';
import AddTable from '../components/add-table.js';
import DeleteTable from '../components/delete-table.js';
import AddColumn from '../components/add-column.js';
import TableData from '../components/table-data.js';
import AddRow from '../components/add-row.js';
import TableCell from '../components/table-cell.js';
import DeleteRow from '../components/delete-row.js';
import IDBTable from '../components/idb-table.js';

function init(events) {
  let db = null;
  let renderedTableNames = [];

  events.on(eventTypes.APPLY_RENDER_TABLE, applyRenderTable);

  events.on(eventTypes.ON_IDB_OPEN_SUCCESS, onIDBOpenSuccess);
  events.on(eventTypes.ON_IDB_OPEN_UPGRADE_NEEDED, onIDBOpenUpgradeNeeded);

  document.addEventListener(AddTable.EVENT_ADD_TABLE, onAddTable);
  document.addEventListener(DeleteTable.EVENT_DELETE_TABLE, onDeleteTable);
  document.addEventListener(AddColumn.EVENT_ADD_COLUMN, onAddColumn);
  document.addEventListener(TableData.EVENT_DELETE_COLUMN, onDeleteColumn);
  document.addEventListener(AddRow.EVENT_ADD_ROW, onAddRow);
  document.addEventListener(
    TableCell.EVENT_UPDATE_CELL_VALUE,
    onUpdateCellValue,
  );
  document.addEventListener(DeleteRow.EVENT_DELETE_ROW, onDeleteRow);

  function applyRenderTable() {
    const objectStoreNames = Array.from(db.objectStoreNames);

    objectStoreNames.forEach((tableName) => {
      const transaction = db.transaction(tableName);
      const objectStore = transaction.objectStore(tableName);
      const indexNames = Array.from(objectStore.indexNames);

      const request = objectStore.getAll();

      request.addEventListener('success', (e) => {
        let idbTableEl = document.querySelector(
          `${IDBTable.TAG_NAME}[${IDBTable.DATA_TABLE_NAME}="${tableName}"]`,
        );

        if (!idbTableEl) {
          idbTableEl = document.createElement(IDBTable.TAG_NAME);
          idbTableEl.setAttribute(IDBTable.DATA_TABLE_NAME, tableName);
          document.body.appendChild(idbTableEl);
        }

        const newColumnNames = JSON.stringify(indexNames);
        if (
          idbTableEl.getAttribute(IDBTable.DATA_COLUMN_NAMES) !== newColumnNames
        ) {
          idbTableEl.setAttribute(IDBTable.DATA_COLUMN_NAMES, newColumnNames);
        }

        const rows = e.target.result;
        const newNextKey = JSON.stringify(
          Math.max.apply(Math, rows.map((row) => row._key).concat(-1)) + 1,
        );
        if (idbTableEl.getAttribute(IDBTable.DATA_NEXT_KEY) !== newNextKey) {
          idbTableEl.setAttribute(IDBTable.DATA_NEXT_KEY, newNextKey);
        }

        const newRows = JSON.stringify(rows);
        if (idbTableEl.getAttribute(IDBTable.DATA_ROWS) !== newRows) {
          idbTableEl.setAttribute(IDBTable.DATA_ROWS, newRows);
        }
      });
    });

    renderedTableNames.forEach((tableName) => {
      if (!objectStoreNames.includes(tableName)) {
        const tableContainerEl = document.querySelector(
          `${IDBTable.TAG_NAME}[${IDBTable.DATA_TABLE_NAME}="${tableName}"]`,
        );
        document.body.removeChild(tableContainerEl);
      }
    });

    renderedTableNames = objectStoreNames;
  }

  function onIDBOpenUpgradeNeeded(eventId, eventData) {
    db = eventData.db;

    switch (eventData.upgradeType) {
      case upgradeTypes.INIT: {
        // do nothing
        break;
      }
      case upgradeTypes.ADD_A_TABLE: {
        db.createObjectStore(eventData.tableName, { keyPath: '_key' });
        break;
      }
      case upgradeTypes.ADD_A_COLUMN: {
        const transaction = eventData.openTransaction;
        const objectStore = transaction.objectStore(eventData.tableName);
        objectStore.createIndex(eventData.columnName, eventData.columnName);
        break;
      }
      case upgradeTypes.DELETE_A_COLUMN: {
        const transaction = eventData.openTransaction;
        const objectStore = transaction.objectStore(eventData.tableName);
        objectStore.deleteIndex(eventData.columnName);
        break;
      }
      case upgradeTypes.DELETE_A_TABLE: {
        db.deleteObjectStore(eventData.tableName);
        break;
      }
      default: {
        throw new Error('Unexpected upgradeType:' + eventData.upgradeType);
      }
    }
  }

  function onIDBOpenSuccess(eventId, eventData) {
    db = eventData.db;

    switch (eventData.upgradeType) {
      case upgradeTypes.INIT:
      case upgradeTypes.ADD_A_COLUMN:
      case upgradeTypes.ADD_A_TABLE:
      case upgradeTypes.DELETE_A_COLUMN:
      case upgradeTypes.DELETE_A_TABLE:
        events.emit(eventTypes.APPLY_RENDER_TABLE);
        break;
      default:
        throw new Error('Unexpected upgradeType:' + eventData.upgradeType);
    }
  }

  function onAddTable(e) {
    events.emit(eventTypes.APPLY_OPEN_DB, {
      upgradeType: upgradeTypes.ADD_A_TABLE,
      tableName: e.detail.tableName,
    });
  }

  function onDeleteTable(e) {
    events.emit(eventTypes.APPLY_OPEN_DB, {
      upgradeType: upgradeTypes.DELETE_A_TABLE,
      tableName: e.detail.tableName,
    });
  }

  function onAddColumn(e) {
    events.emit(eventTypes.APPLY_OPEN_DB, {
      tableName: e.detail.tableName,
      columnName: e.detail.columnName,
      upgradeType: upgradeTypes.ADD_A_COLUMN,
    });
  }

  function onDeleteColumn(e) {
    events.emit(eventTypes.APPLY_OPEN_DB, {
      upgradeType: upgradeTypes.DELETE_A_COLUMN,
      tableName: e.detail.tableName,
      columnName: e.detail.columnName,
    });
  }

  function onAddRow(e) {
    const transaction = db.transaction(e.detail.tableName, 'readwrite');
    const objectStore = transaction.objectStore(e.detail.tableName);
    const newRow = {
      _key: e.detail.nextKey,
    };
    objectStore.add(newRow);

    transaction.addEventListener('complete', () => {
      events.emit(eventTypes.APPLY_RENDER_TABLE);
    });
  }

  function onUpdateCellValue(e) {
    const transaction = db.transaction(e.detail.tableName, 'readwrite');
    const objectStore = transaction.objectStore(e.detail.tableName);
    const getReq = objectStore.get(e.detail.key);
    getReq.addEventListener('success', (_e) => {
      const data = _e.target.result;
      data[e.detail.columnName] = e.detail.value;
      const putReq = objectStore.put(data);
      putReq.addEventListener('success', () => {
        events.emit(eventTypes.APPLY_RENDER_TABLE);
      });
    });
  }

  function onDeleteRow(e) {
    const transaction = db.transaction(e.detail.tableName, 'readwrite');
    const objectStore = transaction.objectStore(e.detail.tableName);
    objectStore.delete(e.detail.key);

    transaction.addEventListener('complete', () => {
      events.emit(eventTypes.APPLY_RENDER_TABLE);
    });
  }

  events.emit(eventTypes.APPLY_OPEN_DB, { upgradeType: upgradeTypes.INIT });
}

export default { init };
