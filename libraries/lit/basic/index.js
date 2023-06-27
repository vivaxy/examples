/**
 * @since 2023-06-27
 * @author vivaxy
 */
import {
  LitElement,
  html,
  css,
} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js';

export class LitBasicExample extends LitElement {
  static properties = {
    count: { type: Number },
  };

  static styles = css`
    :host {
      color: blue;
    }
    :host span {
      color: red;
    }
  `;

  constructor() {
    super();
    this.count = 1;
  }

  add() {
    this.count++;
  }

  render() {
    return html`<div @click="${this.add}">
      Count: <span>${this.count}</span>!
    </div>`;
  }
}

customElements.define('lit-basic-example', LitBasicExample);
