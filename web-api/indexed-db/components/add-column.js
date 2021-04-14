export default class AddColumn extends HTMLElement {
  static get TAG_NAME() {
    return 'add-column';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get EVENT_ADD_COLUMN() {
    return 'add-column';
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
    @import "index.css";
  </style>
  <button>Add Column</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      const columnName = prompt('Column name:');

      document.dispatchEvent(
        new CustomEvent(AddColumn.EVENT_ADD_COLUMN, {
          detail: {
            tableName: this.getAttribute(AddColumn.DATA_TABLE_NAME),
            columnName,
          },
        }),
      );
    });
  }
}

customElements.define(AddColumn.TAG_NAME, AddColumn);
