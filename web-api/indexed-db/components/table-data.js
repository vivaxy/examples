import DeleteColumn from './delete-column.js';
import DeleteRow from './delete-row.js';
import TableCell from './table-cell.js';

export default class TableData extends HTMLElement {
  static get TAG_NAME() {
    return 'table-data';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_COLUMN_NAMES() {
    return 'data-column-names';
  }

  static get DATA_ROWS() {
    return 'data-rows';
  }

  static get EVENT_DELETE_COLUMN() {
    return 'delete-column';
  }

  static get observedAttributes() {
    return [
      TableData.DATA_TABLE_NAME,
      TableData.DATA_COLUMN_NAMES,
      TableData.DATA_ROWS,
    ];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      table {
        border: 1px solid #ccc;
        padding: 8px;
        margin: 8px 0;
      }
    </style>
    <table>
      <thead>
      <tr></tr>
      </thead>
      <tbody>
      </tbody>
    </table>`;
    this.shadow.innerHTML = content;

    this.render();
  }

  render() {
    const tHead = this.shadow.querySelector('thead');
    const headTr = tHead.querySelector('tr');

    while (headTr.firstChild) {
      headTr.removeChild(headTr.firstChild);
    }

    const columnNames = JSON.parse(
      this.getAttribute(TableData.DATA_COLUMN_NAMES),
    );

    if (columnNames) {
      columnNames.forEach((columnName) => {
        const td = document.createElement('td');
        const nameEl = document.createElement('span');
        nameEl.innerHTML = columnName;
        td.appendChild(nameEl);

        const deleteColumn = document.createElement(DeleteColumn.TAG_NAME);
        deleteColumn.setAttribute(
          DeleteColumn.DATA_TABLE_NAME,
          this.getAttribute(TableData.DATA_TABLE_NAME),
        );
        deleteColumn.setAttribute(DeleteColumn.DATA_COLUMN_NAME, columnName);

        td.appendChild(deleteColumn);

        headTr.appendChild(td);
      });
    }

    const tBody = this.shadow.querySelector('tbody');
    while (tBody.firstChild) {
      tBody.removeChild(tBody.firstChild);
    }

    const rows = JSON.parse(this.getAttribute(TableData.DATA_ROWS));
    if (columnNames && rows) {
      rows.forEach((row) => {
        const tr = document.createElement('tr');
        columnNames.forEach((columnName) => {
          const td = document.createElement('td');

          const tableCellEl = document.createElement(TableCell.TAG_NAME);
          tableCellEl.setAttribute(
            TableCell.DATA_TABLE_NAME,
            this.getAttribute(TableData.DATA_TABLE_NAME),
          );
          tableCellEl.setAttribute(TableCell.DATA_COLUMN_NAME, columnName);
          tableCellEl.setAttribute(TableCell.DATA_KEY, String(row._key));
          tableCellEl.setAttribute(
            TableCell.DATA_CELL_VALUE,
            row[columnName] === undefined ? '' : row[columnName],
          );

          td.appendChild(tableCellEl);
          tr.appendChild(td);
        });

        const deleteRow = document.createElement(DeleteRow.TAG_NAME);
        deleteRow.setAttribute(
          DeleteRow.DATA_TABLE_NAME,
          this.getAttribute(TableData.DATA_TABLE_NAME),
        );
        deleteRow.setAttribute(DeleteRow.DATA_KEY, String(row._key));
        tr.appendChild(deleteRow);

        tBody.appendChild(tr);
      });
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === TableData.DATA_COLUMN_NAMES) {
      this.render();
    } else if (name === TableData.DATA_ROWS) {
      this.render();
    }
  }
}

customElements.define(TableData.TAG_NAME, TableData);
