export default class AddTable extends HTMLElement {
  static get TAG_NAME() {
    return 'add-table';
  }

  static get EVENT_ADD_TABLE() {
    return 'add-table';
  }

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    const content = `<style>@import "index.css";</style>
    <button>Add Table</button>`;
    shadow.innerHTML = content;
    const button = shadow.querySelector('button');
    button.addEventListener('click', () => {
      const tableName = prompt('Table name:');

      document.dispatchEvent(
        new CustomEvent(AddTable.EVENT_ADD_TABLE, { detail: { tableName } }),
      );
    });
  }
}

customElements.define(AddTable.TAG_NAME, AddTable);
