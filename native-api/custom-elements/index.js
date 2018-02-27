/**
 * @since 20180226 13:03
 * @author vivaxy
 */

class BaseElement extends HTMLElement {
    constructor() {
        super();
        if (!this.render) {
            throw new Error('render method is required');
        }
        this.state = (this.constructor.observedAttributes || []).reduce((attr, key) => ({
            ...attr,
            [key]: this.getAttribute(key)
        }), {});
        this.shadow = this.attachShadow({ mode: 'open' });
        this.clearAndRender();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this.state[name] = newValue;
        this.clearAndRender();
    }

    clearAndRender() {
        Array.from(this.shadow.children).map(child => child.remove());
        const nodes = this.render();
        if (Array.isArray(nodes)) {
            nodes.map(node => this.shadow.appendChild(node));
        } else {
            this.shadow.appendChild(nodes);
        }
    }

    createElement({ type, attributes = {}, children, events = {} }) {
        const element = document.createElement(type);
        Object.keys(attributes).map(key => element.setAttribute(key, attributes[key]));
        if (typeof children === 'string') {
            element.textContent = children;
        } else if (children instanceof HTMLElement) {
            element.appendChild(children);
        } else if (Array.isArray(children)) {
            children.map((child) => {
                if (children instanceof HTMLElement) {
                    return element.appendChild(child);
                }
            });
        }
        Object.keys(events).map(key => element.addEventListener(key, events[key]));
        return element;
    }

}

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

class ExampleRoot extends BaseElement {

    static get observedAttributes() {
        return ['width', 'height'];
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
        super.attributeChangedCallback(name, oldValue, newValue);
        console.log('attributeChangedCallback', name, oldValue, newValue);
    }

    handleDispatchEvent() {
        const event = new CustomEvent('example-event');
        event.currentAttr = this.state;
        this.dispatchEvent(event);
    }

    updateAttribute(name) {
        return (e) => {
            this.setAttribute(name, e.value);
        };
    }

    createInputForm(name) {
        return this.createElement({
            type: 'input-form',
            attributes: { value: this.state[name], name: `Set ${name}` },
            events: { 'set-value': this.updateAttribute.call(this, name) },
        });
    }

    render() {
        return [
            this.createInputForm('width'),
            this.createElement({ type: 'hr' }),
            this.createInputForm('height'),
            this.createElement({ type: 'hr' }),
            this.createElement({
                type: 'button',
                children: 'Dispatch event',
                events: { click: this.handleDispatchEvent.bind(this) },
            }),
        ];
    }
}

customElements.define('example-root', ExampleRoot);
document.querySelector('example-root').addEventListener('example-event', e => console.log(e.currentAttr));
