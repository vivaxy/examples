export default class DeleteTable extends HTMLElement {
  static get TAG_NAME() {
    return 'delete-table';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get EVENT_DELETE_TABLE() {
    return 'delete-table';
  }

  static get observedAttributes() {
    return [DeleteTable.DATA_TABLE_NAME];
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      @import "index.css";
    </style>
    <button>Delete Table</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent(DeleteTable.EVENT_DELETE_TABLE, {
          detail: {
            tableName: this.getAttribute(DeleteTable.DATA_TABLE_NAME),
          },
        }),
      );
    });
  }
}

customElements.define(DeleteTable.TAG_NAME, DeleteTable);
