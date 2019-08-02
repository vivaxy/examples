export default class ModuleItem extends HTMLElement {
  static get TAG_NAME() {
    return 'module-item';
  }

  static get DATA_NAME() {
    return 'data-name';
  }

  static get DATA_VERSION() {
    return 'data-version';
  }

  static get DATA_DEPENDENCIES() {
    return 'data-dependencies';
  }

  static get observedAttributes() {
    return [
      ModuleItem.DATA_NAME,
      ModuleItem.DATA_VERSION,
      ModuleItem.DATA_DEPENDENCIES,
    ];
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
    const name = this.getAttribute(ModuleItem.DATA_NAME);
    const version = this.getAttribute(ModuleItem.DATA_VERSION);
    const dependencies = JSON.parse(
      decodeURIComponent(
        this.getAttribute(ModuleItem.DATA_DEPENDENCIES) || '[]',
      ),
    );

    this.shadow.innerHTML = `<style></style>
<div class="${ModuleItem.TAG_NAME}">
<pre>"name": "${name}",
"version": "${version}",
"dependencies": {
${Object.keys(dependencies)
  .map(function(name) {
    const version = dependencies[name];
    return `  "${name}": "${version}"`;
  })
  .join(',\n')}
}</pre>
</div>`;
  }
}

customElements.define(ModuleItem.TAG_NAME, ModuleItem);
