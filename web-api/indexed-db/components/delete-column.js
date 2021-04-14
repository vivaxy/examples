export default class DeleteColumn extends HTMLElement {
  static get TAG_NAME() {
    return 'delete-column';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_COLUMN_NAME() {
    return 'data-column-name';
  }

  static get EVENT_DELETE_COLUMN() {
    return 'delete-column';
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      @import "index.css";
    </style>
    <button>Delete Column</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent(DeleteColumn.EVENT_DELETE_COLUMN, {
          detail: {
            tableName: this.getAttribute(DeleteColumn.DATA_TABLE_NAME),
            columnName: this.getAttribute(DeleteColumn.DATA_COLUMN_NAME),
          },
        }),
      );
    });
  }
}

customElements.define(DeleteColumn.TAG_NAME, DeleteColumn);
