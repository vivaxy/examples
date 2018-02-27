/**
 * @since 20180227 18:31
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
                if (child instanceof HTMLElement) {
                    return element.appendChild(child);
                }
            });
        }
        Object.keys(events).map(key => element.addEventListener(key, events[key]));
        return element;
    }

}

