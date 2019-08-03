import { html } from '//unpkg.com/htm/preact/standalone.module.js';
import CHANGE_TYPES from '../enums/change-types.js';

export default function ModuleItem(props) {
  const { name, version, dependencies, updated, editable, onChange } = props;

  function handleNameChange(e) {
    onChange({
      type: CHANGE_TYPES.NAME,
      name,
      value: e.target.value,
    });
  }

  function handleVersionChange(e) {
    onChange({
      type: CHANGE_TYPES.VERSION,
      name,
      value: e.target.value,
    });
  }

  function handleDependencyVersionChange({ dependencyName }) {
    return function(e) {
      onChange({
        type: CHANGE_TYPES.DEPENDENCY_VERSION,
        name,
        dependencyName,
        value: e.target.value,
      });
    };
  }

  function handleDeleteDependency({ dependencyName }) {
    return function() {
      onChange({
        type: CHANGE_TYPES.DELETE_DEPENDENCY,
        name,
        dependencyName,
      });
    };
  }

  function handleAddDependency() {
    onChange({
      type: CHANGE_TYPES.ADD_DEPENDENCY,
      name,
    });
  }

  function handleDelete() {
    onChange({
      type: CHANGE_TYPES.DELETE,
      name,
    });
  }

  return html`
    <div>
      <style>
        .module-item {
          margin: 12px;
          font-family: monospace;
          font-size: 12px;
          line-height: 14px;
        }
        .module-item-updated {
          color: red;
        }
        .value-input {
          font-family: monospace;
          font-size: 12px;
          line-height: 12px;
          border: 1px solid #efefef;
          margin: 0;
          padding: 0;
        }
        .dependency {
          margin-left: 14px;
        }
      </style>
      <div class="module-item ${updated && 'module-item-updated'}">
        <div>
          "name":
          "${editable
            ? html`
                <input
                  class="value-input"
                  value="${name}"
                  onChange="${handleNameChange}"
                />
              `
            : name}",${editable &&
            html`
              <button onClick="${handleDelete}">-</button>
            `}
        </div>
        <div>
          "version":
          "${editable
            ? html`
                <input
                  class="value-input"
                  value="${version}"
                  onChange="${handleVersionChange}"
                />
              `
            : version}",
        </div>
        <div>"dependencies": {</div>
        ${Object.keys(dependencies).map(function(dependencyName, index, array) {
          const version = dependencies[dependencyName];
          return html`
            <div class="dependency">
              ${editable &&
                html`
                  <button
                    onClick="${handleDeleteDependency({ dependencyName })}"
                  >
                    -
                  </button>
                `}"${dependencyName}":
              "${editable
                ? html`
                    <input
                      class="value-input"
                      value="${version}"
                      onChange="${handleDependencyVersionChange({
                        dependencyName,
                      })}"
                    />
                  `
                : version}"${array.length - 1 === index ? '' : ','}
            </div>
          `;
        })}
        }${editable &&
          html`
            <button onClick="${handleAddDependency}">+</button>
          `}
      </div>
    </div>
  `;
}
