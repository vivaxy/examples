/**
 * @since 2019-08-02 19:18
 * @author vivaxy
 */
import { html } from '//unpkg.com/htm/preact/standalone.module.js';
import RELEASE_TYPES from '../enums/release-types.js';

export default function ReleaseTypeSelect(props) {
  const { name, releaseType, onChange } = props;

  function handleChange(e) {
    onChange({
      name,
      releaseType: e.target.value,
    });
  }

  return html`
    <div>
      <style>
        .release-type-select {
          font-family: monospace;
          font-size: 12px;
          line-height: 14px;
          margin: 12px;
          display: inline-block;
        }
      </style>
      <div class="release-type-select">
        <label for="${name}">${name}:</label>
        <select id="${name}" onChange="${handleChange}">
          ${Object.keys(RELEASE_TYPES).map(function(key) {
            const rt = RELEASE_TYPES[key];
            return html`
              <option selected="${rt === releaseType}">${rt}</option>
            `;
          })}
        </select>
      </div>
    </div>
  `;
}
