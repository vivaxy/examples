/**
 * @since 20180226 13:03
 * @author vivaxy
 */

class InputForm extends HTMLElement {

    static get observedAttributes() {
        return ['value', 'name'];
    }

    constructor() {
        super();
        this.state = { value: this.getAttribute('value'), name: this.getAttribute('name') };
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
        this.attachEvents();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.state[name] = newValue;
    }

    attachEvents() {
        const button = this.shadow.querySelector('.js-button');
        const input = this.shadow.querySelector('.js-input');
        input.addEventListener('change', (e) => {
            this.state.value = e.target.value;
        });
        button.addEventListener('click', () => {
            const event = new CustomEvent('set-value');
            event.value = this.state.value;
            this.dispatchEvent(event);
        });
    }

    render() {
        const { value, name } = this.state;
        this.shadow.innerHTML = `<input type="text" value="${value}" class="js-input" /><button class="js-button">${name}</button>`
    }
}

class ExampleRoot extends HTMLElement {

    static get observedAttributes() {
        return ['width'];
    }

    constructor() {
        super();
        this.state = {
            width: this.getAttribute('width'),
            height: this.getAttribute('height'),
        };
        this.shadow = this.attachShadow({ mode: 'open' });
        this.render();
        this.attachEvents();
    }

    connectedCallback() {
        console.log('connectedCallback');
    }

    disconnectedCallback() {
        console.log('disconnectedCallback');
    }

    adoptedCallback() {
        console.log('adoptedCallback');
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log('attributeChangedCallback', name, oldValue, newValue);
        this.state[name] = newValue;
    }

    attachEvents() {
        const widthInputForm = this.shadow.querySelector('.js-width');
        const heightInputForm = this.shadow.querySelector('.js-height');
        widthInputForm.addEventListener('set-value', (e) => {
            this.setAttribute('width', e.value);
        });
        heightInputForm.addEventListener('set-value', (e) => {
            this.setAttribute('height', e.value);
        });
        const dispatchEventButton = this.shadow.querySelector('.js-dispatch-event-button');
        dispatchEventButton.addEventListener('click', () => {
            const event = new CustomEvent('example-event');
            event.currentAttr = this.state;
            this.dispatchEvent(event);
        });
    }

    render() {
        const { width, height } = this.state;
        this.shadow.innerHTML = `<div>
    <input-form value="${width}" class="js-width" name="Set width"></input-form>
    <hr />
    <input-form value="${height}" class="js-height" name="Set height"></input-form>
    <hr />
    <button class="js-dispatch-event-button">Dispatch event</button>
</div>`
    }
}

customElements.define('example-root', ExampleRoot);
customElements.define('input-form', InputForm);
document.querySelector('example-root').addEventListener('example-event', (e) => {
    console.log(e.currentAttr);
});
