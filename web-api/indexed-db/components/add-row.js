export default class AddRow extends HTMLElement {
  static get TAG_NAME() {
    return 'add-row';
  }

  static get DATA_TABLE_NAME() {
    return 'data-table-name';
  }

  static get DATA_NEXT_KEY() {
    return 'data-next-key';
  }

  static get EVENT_ADD_ROW() {
    return 'add-row';
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>
      @import "index.css";
    </style>
    <button>Add Row</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      document.dispatchEvent(
        new CustomEvent(AddRow.EVENT_ADD_ROW, {
          detail: {
            tableName: this.getAttribute(AddRow.DATA_TABLE_NAME),
            nextKey: Number(this.getAttribute(AddRow.DATA_NEXT_KEY)),
          },
        }),
      );
    });
  }
}

customElements.define(AddRow.TAG_NAME, AddRow);
