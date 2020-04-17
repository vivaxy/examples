export default class DeleteRow extends HTMLElement {
  static get TAG_NAME() {
    return 'delete-row';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_KEY() {
    return 'data-key';
  }

  static get EVENT_DELETE_ROW() {
    return 'delete-row';
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      @import "index.css";
    </style>
    <button>Delete Row</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent(DeleteRow.EVENT_DELETE_ROW, {
          detail: {
            tableName: this.getAttribute(DeleteRow.DATA_TABLE_NAME),
            key: Number(this.getAttribute(DeleteRow.DATA_KEY)),
          },
        }),
      );
    });
  }
}

customElements.define(DeleteRow.TAG_NAME, DeleteRow);
