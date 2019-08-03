/**
 * @since 2019-08-03 18:30:36
 * @author vivaxy
 */
import { html, Component } from '//unpkg.com/htm/preact/standalone.module.js';
import RELEASE_TYPES from '../enums/release-types.js';
import CHANGE_TYPES from '../enums/change-types.js';
import STORAGE_KEYS from '../enums/storage-keys.js';
import Modules from './modules.js';
import ReleaseTypeSelect from './release-type-select.js';
import * as semver from '../vendor/semver.js';

function update(m) {
  const modules = JSON.parse(JSON.stringify(m));
  gatherDependencyGraph(modules);
  const updatedModules = [];
  Object.keys(modules).forEach(function(name) {
    if (modules[name].releaseType !== RELEASE_TYPES.NONE) {
      modules[name].version = semver.inc(
        modules[name].version,
        modules[name].releaseType,
      );
      modules[name].updated = true;
      updatedModules.push(name);
    }
  });
  updatedModules.forEach(function(name) {
    modules[name].dependent.forEach(function(dependentName) {
      if (
        !semver.satisfies(
          modules[name].version,
          modules[dependentName].dependencies[name],
        )
      ) {
        modules[dependentName].dependencies[name] = `^${modules[name].version}`;
        if (!modules[dependentName].updated) {
          modules[dependentName].version = semver.inc(
            modules[dependentName].version,
            RELEASE_TYPES.PATCH,
          );
          modules[dependentName].updated = true;
        }
      }
    });
  });
  return modules;
}

function gatherDependencyGraph(modules) {
  Object.keys(modules).forEach(function(name) {
    modules[name].dependent = modules[name].dependent || [];
    const { dependencies } = modules[name];
    Object.keys(dependencies).forEach(function(dependencyName) {
      modules[dependencyName].dependent =
        modules[dependencyName].dependent || [];
      modules[dependencyName].dependent.push(name);
    });
  });
}

function updateKeys(
  object,
  onModule,
  before = function() {},
  after = function() {},
) {
  const ret = {};
  before(ret);
  Object.keys(object).forEach(function(key) {
    onModule(ret, key, object[key], object);
  });
  after(ret);
  return ret;
}

const defaultModules = {
  a: {
    version: '1.0.0',
    dependencies: {
      b: '^1.0.0',
      c: '^1.0.0',
    },
    releaseType: RELEASE_TYPES.NONE,
  },
  b: {
    version: '1.0.0',
    dependencies: {
      c: '^1.0.0',
    },
    releaseType: RELEASE_TYPES.NONE,
  },
  c: {
    version: '1.0.0',
    dependencies: {},
    releaseType: RELEASE_TYPES.NONE,
  },
};

export default class App extends Component {
  constructor(props) {
    super(props);
    const modulesString = localStorage.getItem(STORAGE_KEYS.MODULES);
    if (!modulesString) {
      localStorage.setItem(
        STORAGE_KEYS.MODULES,
        JSON.stringify(defaultModules),
      );
      this.state = {
        modules: defaultModules,
      };
    } else {
      this.state = {
        modules: JSON.parse(modulesString),
      };
    }
  }

  updateModules(newModules) {
    localStorage.setItem(STORAGE_KEYS.MODULES, JSON.stringify(newModules));
    this.setState({ modules: newModules });
  }

  render() {
    const { modules } = this.state;
    const updatedModules = update(modules);

    const handleReleaseTypeChange = ({ name, releaseType }) => {
      modules[name].releaseType = releaseType;
      this.updateModules(modules);
    };

    const handlers = {
      [CHANGE_TYPES.NAME]: ({ name, value }) => {
        const newModules = updateKeys(modules, function(ret, key, value) {
          const dependencies = updateKeys(value.dependencies, function(
            _ret,
            _key,
            _value,
          ) {
            if (_key === name) {
              _ret[value] = _value;
            } else {
              _ret[_key] = _value;
            }
          });
          if (name === key) {
            ret[value] = {
              ...value,
              dependencies,
            };
          } else {
            ret[key] = {
              ...value,
              dependencies,
            };
          }
        });
        this.updateModules(newModules);
      },
      [CHANGE_TYPES.VERSION]: ({ name, value }) => {
        if (!semver.valid(value)) {
          value = modules[name].version;
        }
        modules[name].version = value;
        this.updateModules(modules);
      },
      [CHANGE_TYPES.DEPENDENCY_VERSION]: ({ name, value, dependencyName }) => {
        if (!semver.validRange(value)) {
          value = modules[name].dependencies[dependencyName];
        }
        modules[name].dependencies[dependencyName] = value;
        this.updateModules(modules);
      },
      [CHANGE_TYPES.DELETE_DEPENDENCY]: ({ name, dependencyName }) => {
        delete modules[name].dependencies[dependencyName];
        this.updateModules(modules);
      },
      [CHANGE_TYPES.ADD_DEPENDENCY]: ({ name }) => {
        let newName = undefined;
        while (
          newName !== null &&
          (!modules[newName] ||
            newName === name ||
            modules[name].dependencies[newName])
        ) {
          newName = prompt(`module "${name}" new dependency name:`);
        }
        if (newName === null) {
          // user cancelled
          return;
        }
        let newVersion = undefined;
        while (newVersion !== null && !semver.validRange(newVersion)) {
          newVersion = prompt(
            `module "${name}" new dependency "${newName}" version:`,
          );
        }
        if (newVersion === null) {
          // user cancelled
          return;
        }
        modules[name].dependencies[newName] = newVersion;
        this.updateModules(modules);
      },
      [CHANGE_TYPES.DELETE]: ({ name }) => {
        delete modules[name];
        this.updateModules(modules);
      },
      [CHANGE_TYPES.ADD]: () => {
        let newName = undefined;
        while (newName !== null && (!newName || modules[newName])) {
          newName = prompt(`name:`);
        }
        if (newName === null) {
          // user cancelled
          return;
        }
        let newVersion = undefined;
        while (newVersion !== null && !semver.valid(newVersion)) {
          newVersion = prompt(`module "${newName}" version:`);
        }
        if (newVersion === null) {
          // user cancelled
          return;
        }
        modules[newName] = {
          version: newVersion,
          dependencies: {},
          releaseType: RELEASE_TYPES.NONE,
        };
        this.updateModules(modules);
      },
    };

    const handleModuleChange = ({ type, name, value, dependencyName }) => {
      if (handlers[type]) {
        handlers[type]({ name, value, dependencyName });
      } else {
        throw new Error('Unexpected type: ' + type);
      }
    };

    return html`
      <div>
        <style>
          body {
            margin: 0;
            font-size: 14px;
            font-family: monospace;
            line-height: 18px;
            box-sizing: border-box;
          }

          button,
          input,
          select {
            appearance: none;
            -webkit-appearance: none;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: #fff;
            padding: 0 4px;
            font-size: 12px;
            line-height: 16px;
            font-family: monospace;
          }

          button {
            margin-left: 8px;
          }

          input {
            margin: 0;
            width: 60px;
          }

          .release-type-select {
            margin: 12px;
          }

          .module-item {
            margin: 12px;
          }
          .module-item-updated {
            color: red;
          }
          .dependency {
            margin-left: 14px;
          }
        </style>
        <${Modules}
          modules="${modules}"
          editable
          onChange="${handleModuleChange}"
        />
        ${Object.keys(modules).map(function(name) {
          const releaseType = modules[name].releaseType;
          return html`
            <${ReleaseTypeSelect}
              name="${name}"
              releaseType="${releaseType}"
              onChange="${handleReleaseTypeChange}"
            />
          `;
        })}
        <${Modules} modules="${updatedModules}" />
      </div>
    `;
  }
}
