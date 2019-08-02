/**
 * @since 2019-08-02 19:01
 * @author vivaxy
 */
import ModuleItem from './module-item.js';

export default class Modules extends HTMLElement {
  static get TAG_NAME() {
    return 'module-s';
  }

  static get DATA_MODULES() {
    return 'data-modules';
  }

  static get observedAttributes() {
    return [Modules.DATA_MODULES];
  }

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'closed' });
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const modules = JSON.parse(this.getAttribute(Modules.DATA_MODULES) || '[]');
    this.shadow.innerHTML = `<style></style>
<div class="${Modules.TAG_NAME}"></div>`;
    const root = this.shadow.querySelector(`.${Modules.TAG_NAME}`);
    Object.keys(modules).forEach(function(name) {
      const { version, dependencies, updated } = modules[name];
      const moduleItem = document.createElement(ModuleItem.TAG_NAME);
      moduleItem.setAttribute(ModuleItem.DATA_NAME, name);
      moduleItem.setAttribute(ModuleItem.DATA_VERSION, version);
      moduleItem.setAttribute(
        ModuleItem.DATA_DEPENDENCIES,
        JSON.stringify(dependencies),
      );
      if (updated) {
        moduleItem.setAttribute(ModuleItem.DATA_UPDATED, '');
      }
      root.appendChild(moduleItem);
    });
  }
}

customElements.define(Modules.TAG_NAME, Modules);
