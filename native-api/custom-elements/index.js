/**
 * @since 20180226 13:03
 * @author vivaxy
 */

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
        this.render(this.state);
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
        const widthButton = this.shadow.querySelector('.js-width-button');
        const heightButton = this.shadow.querySelector('.js-height-button');
        widthButton.addEventListener('click', () => {
            this.setAttribute('width', this.shadow.querySelector('.js-width-input').value);
        });
        heightButton.addEventListener('click', () => {
            this.setAttribute('height', this.shadow.querySelector('.js-height-input').value);
        });
        const dispatchEventButton = this.shadow.querySelector('.js-dispatch-event-button');
        dispatchEventButton.addEventListener('click', () => {
            const event = new CustomEvent('example-event');
            event.currentAttr = this.state;
            this.dispatchEvent(event);
        });
    }

    render(state) {
        this.shadow.innerHTML = `<div>
    <input type="text" value="${state.width}" class="js-width-input" />
    <button class="js-width-button">Set width attribute</button>
    <hr />
    <input type="text" value="${state.height}" class="js-height-input" />
    <button class="js-height-button">Set height attribute</button>
    <hr />
    <button class="js-dispatch-event-button">Dispatch event</button>
</div>`
    }
}

customElements.define('example-root', ExampleRoot);
document.querySelector('example-root').addEventListener('example-event', (e) => {
    console.log(e.currentAttr);
});
