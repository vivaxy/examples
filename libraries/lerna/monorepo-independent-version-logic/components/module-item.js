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
    <div class="module-item${updated ? ' module-item-updated' : ''}">
      <div>
        "name":
        "${editable
          ? html`
              <input value="${name}" onChange="${handleNameChange}" />
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
              <input value="${version}" onChange="${handleVersionChange}" />
            `
          : version}",
      </div>
      <div>"dependencies": {</div>
      ${Object.keys(dependencies).map(function(dependencyName, index, array) {
        const version = dependencies[dependencyName];
        return html`
          <div class="dependency">
            "${dependencyName}":
            "${editable
              ? html`
                  <input
                    value="${version}"
                    onChange="${handleDependencyVersionChange({
                      dependencyName,
                    })}"
                  />
                `
              : version}"${array.length - 1 === index ? '' : ','}${editable &&
              html`
                <button onClick="${handleDeleteDependency({ dependencyName })}">
                  -
                </button>
              `}
          </div>
        `;
      })}
      }${editable &&
        html`
          <button onClick="${handleAddDependency}">+</button>
        `}
    </div>
  `;
}
