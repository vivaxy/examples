/**
 * @since 20180227 18:31
 * @author vivaxy
 */

class InputForm extends BaseElement {
  static get observedAttributes() {
    return ['value', 'name'];
  }

  handleSubmit() {
    const event = new CustomEvent('set-value');
    event.value = this.state.value;
    this.dispatchEvent(event);
  }

  handleChange(e) {
    this.state.value = e.target.value;
  }

  render() {
    return [
      this.createElement({
        type: 'input',
        attributes: { type: 'text', value: this.state.value },
        events: { change: this.handleChange.bind(this) },
      }),
      this.createElement({
        type: 'button',
        children: this.state.name,
        events: { click: this.handleSubmit.bind(this) },
      }),
    ];
  }
}

customElements.define('input-form', InputForm);
