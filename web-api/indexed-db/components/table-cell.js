export default class TableCell extends HTMLElement {
  static get TAG_NAME() {
    return 'table-cell';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_COLUMN_NAME() {
    return 'data-column-name';
  }

  static get DATA_CELL_VALUE() {
    return 'data-cell-value';
  }

  static get DATA_KEY() {
    return 'data-key';
  }

  static get EVENT_UPDATE_CELL_VALUE() {
    return 'update-cell-value';
  }

  static get observedAttributes() {
    return [
      TableCell.DATA_TABLE_NAME,
      TableCell.DATA_COLUMN_NAME,
      TableCell.DATA_CELL_VALUE,
      TableCell.DATA_KEY,
    ];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      input {
        border: 1px solid #ddd;
      }
    </style>
    <input type="text" value="" />`;
    this.shadow.innerHTML = content;

    this.input = this.shadow.querySelector('input');

    this.input.addEventListener('change', (e) => {
      document.dispatchEvent(
        new CustomEvent(TableCell.EVENT_UPDATE_CELL_VALUE, {
          detail: {
            tableName: this.getAttribute(TableCell.DATA_TABLE_NAME),
            columnName: this.getAttribute(TableCell.DATA_COLUMN_NAME),
            key: Number(this.getAttribute(TableCell.DATA_KEY)),
            value: e.target.value,
          },
        }),
      );
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === TableCell.DATA_CELL_VALUE) {
      this.input.value = newValue;
    }
  }
}

customElements.define(TableCell.TAG_NAME, TableCell);
