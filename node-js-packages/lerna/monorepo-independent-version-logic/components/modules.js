/**
 * @since 2019-08-02 19:01
 * @author vivaxy
 */
import { html } from '//unpkg.com/htm/preact/standalone.module.js';
import ModuleItem from './module-item.js';
import CHANGE_TYPES from '../enums/change-types.js';

export default function Modules(props) {
  const { modules, editable, onChange } = props;

  function handleChange({ type, name, value, dependencyName }) {
    onChange({ type, name, value, dependencyName });
  }

  function handleAdd() {
    onChange({ type: CHANGE_TYPES.ADD });
  }

  return html`
    <div>
      <style>
        .edit-button {
          margin: 12px;
        }
      </style>
      <div class="modules">
        ${Object.keys(modules).map(function(name) {
          const { version, dependencies, updated } = modules[name];
          return html`
            <${ModuleItem}
              name="${name}"
              version="${version}"
              dependencies="${dependencies}"
              updated="${updated}"
              editable="${editable}"
              onChange="${handleChange}"
            />
          `;
        })}
        ${editable &&
          html`
            <button class="edit-button" onClick="${handleAdd}">+</button>
          `}
      </div>
    </div>
  `;
}
