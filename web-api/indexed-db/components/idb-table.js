import DeleteTable from './delete-table.js';
import TableData from './table-data.js';
import AddColumn from './add-column.js';
import AddRow from './add-row.js';

export default class IDBTable extends HTMLElement {
  static get TAG_NAME() {
    return 'idb-table';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_COLUMN_NAMES() {
    return 'data-column-names';
  }

  static get DATA_NEXT_KEY() {
    return 'data-next-key';
  }

  static get DATA_ROWS() {
    return 'data-rows';
  }

  static get observedAttributes() {
    return [
      IDBTable.DATA_TABLE_NAME,
      IDBTable.DATA_COLUMN_NAMES,
      IDBTable.DATA_NEXT_KEY,
      IDBTable.DATA_ROWS,
    ];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      .idb-table {
        border: 1px solid #000;
        padding: 8px;
        margin: 8px 0;
      }
    </style>
    <div class="idb-table">
      <span></span>
      <delete-table></delete-table>
      <add-column></add-column>
      <add-row></add-row>
      <table-data></table-data>
    </div>`;
    this.shadow.innerHTML = content;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === IDBTable.DATA_TABLE_NAME) {
      this.shadow.querySelector('span').innerHTML = newValue;
      this.shadow
        .querySelector(DeleteTable.TAG_NAME)
        .setAttribute(DeleteTable.DATA_TABLE_NAME, newValue);
      this.shadow
        .querySelector(TableData.TAG_NAME)
        .setAttribute(TableData.DATA_TABLE_NAME, newValue);
      this.shadow
        .querySelector(AddColumn.TAG_NAME)
        .setAttribute(TableData.DATA_TABLE_NAME, newValue);
      this.shadow
        .querySelector(AddRow.TAG_NAME)
        .setAttribute(TableData.DATA_TABLE_NAME, newValue);
    } else if (name === IDBTable.DATA_COLUMN_NAMES) {
      this.shadow
        .querySelector(TableData.TAG_NAME)
        .setAttribute(TableData.DATA_COLUMN_NAMES, newValue);
    } else if (name === IDBTable.DATA_NEXT_KEY) {
      this.shadow
        .querySelector(AddRow.TAG_NAME)
        .setAttribute(AddRow.DATA_NEXT_KEY, newValue);
    } else if (name === IDBTable.DATA_ROWS) {
      this.shadow
        .querySelector(TableData.TAG_NAME)
        .setAttribute(TableData.DATA_ROWS, newValue);
    }
  }
}

customElements.define(IDBTable.TAG_NAME, IDBTable);
