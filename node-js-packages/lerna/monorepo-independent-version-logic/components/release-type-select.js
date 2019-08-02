/**
 * @since 2019-08-02 19:18
 * @author vivaxy
 */
export default class ReleaseTypeSelect extends HTMLElement {
  static get TAG_NAME() {
    return 'release-type-select';
  }

  static get DATA_NAME() {
    return 'data-name';
  }

  static get DATA_RELEASE_TYPE() {
    return 'data-release-type';
  }

  static get DATA_RELEASE_TYPES() {
    return 'data-release-types';
  }

  static get EVENT_CHANGE() {
    return 'event-change';
  }

  static get observedAttributes() {
    return [
      ReleaseTypeSelect.DATA_NAME,
      ReleaseTypeSelect.DATA_RELEASE_TYPE,
      ReleaseTypeSelect.DATA_RELEASE_TYPES,
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
    const name = this.getAttribute(ReleaseTypeSelect.DATA_NAME) || '';
    const currentReleaseType =
      this.getAttribute(ReleaseTypeSelect.DATA_RELEASE_TYPE) || '';
    const UPDATE_TYPES = JSON.parse(
      this.getAttribute(ReleaseTypeSelect.DATA_RELEASE_TYPES) || '{}',
    );
    this.shadow.innerHTML = `<style></style>
<label for="${name}"><code>${name}:</code></label>
<select id="${name}" class="${ReleaseTypeSelect.TAG_NAME}">${Object.keys(
      UPDATE_TYPES,
    ).map(function(key) {
      const releaseType = UPDATE_TYPES[key];
      return `<option${
        releaseType === currentReleaseType ? ' selected' : ''
      }><code>${releaseType}</code></option>`;
    })}</select>`;
    if (name) {
      this.shadow.querySelector(`#${name}`).addEventListener('change', (e) => {
        this.dispatchEvent(
          new CustomEvent(ReleaseTypeSelect.EVENT_CHANGE, {
            detail: e.target.value,
          }),
        );
      });
    }
  }
}

customElements.define(ReleaseTypeSelect.TAG_NAME, ReleaseTypeSelect);
