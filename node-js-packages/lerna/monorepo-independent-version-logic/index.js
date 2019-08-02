/**
 * @since 2019-08-02 17:41
 * @author vivaxy
 */
import Modules from './components/modules.js';
import ReleaseTypeSelect from './components/release-type-select.js';
import * as semver from './vendor/semver.js';

const RELEASE_TYPES = {
  NONE: 'none',
  PATCH: 'patch',
  MINOR: 'minor',
  MAJOR: 'major',
};

const modules = {
  moduleA: {
    version: '1.0.0',
    dependencies: {
      moduleB: '^1.0.0',
      moduleC: '^1.0.0',
    },
    releaseType: RELEASE_TYPES.NONE,
  },
  moduleB: {
    version: '1.0.0',
    dependencies: {
      moduleC: '^1.0.0',
    },
    releaseType: RELEASE_TYPES.NONE,
  },
  moduleC: {
    version: '1.0.0',
    dependencies: {},
    releaseType: RELEASE_TYPES.NONE,
  },
};

const beforeModules = document.createElement(Modules.TAG_NAME);
beforeModules.setAttribute(Modules.DATA_MODULES, JSON.stringify(modules));
document.body.appendChild(beforeModules);

Object.keys(modules).forEach(function(name) {
  const updateSelect = document.createElement(ReleaseTypeSelect.TAG_NAME);
  updateSelect.setAttribute(ReleaseTypeSelect.DATA_NAME, name);
  updateSelect.setAttribute(
    ReleaseTypeSelect.DATA_RELEASE_TYPE,
    RELEASE_TYPES.NONE,
  );
  updateSelect.setAttribute(
    ReleaseTypeSelect.DATA_RELEASE_TYPES,
    JSON.stringify(RELEASE_TYPES),
  );
  updateSelect.addEventListener(ReleaseTypeSelect.EVENT_CHANGE, function(e) {
    modules[name].releaseType = e.detail;
    afterModules.setAttribute(
      Modules.DATA_MODULES,
      JSON.stringify(update(modules)),
    );
  });
  document.body.appendChild(updateSelect);
});

const afterModules = document.createElement(Modules.TAG_NAME);
afterModules.setAttribute(Modules.DATA_MODULES, JSON.stringify(modules));
document.body.appendChild(afterModules);

function update(_modules) {
  const m = JSON.parse(JSON.stringify(_modules));
  gatherDependencyGraph(m);
  const updatedModules = [];
  Object.keys(m).forEach(function(name) {
    if (m[name].releaseType !== RELEASE_TYPES.NONE) {
      m[name].version = semver.inc(m[name].version, m[name].releaseType);
      updatedModules.push(name);
    }
  });
  updatedModules.forEach(function(name) {
    m[name].dependent.forEach(function(dependentName) {
      if (
        !semver.satisfies(m[name].version, m[dependentName].dependencies[name])
      ) {
        m[dependentName].dependencies[name] = `^${m[name].version}`;
        if (!updatedModules.includes(m[dependentName])) {
          m[dependentName].version = semver.inc(
            m[dependentName].version,
            RELEASE_TYPES.PATCH,
          );
        }
      }
    });
  });
  return m;
}

function gatherDependencyGraph(_modules) {
  Object.keys(_modules).forEach(function(name) {
    _modules[name].dependent = _modules[name].dependent || [];
    const { dependencies } = _modules[name];
    Object.keys(dependencies).forEach(function(dependencyName) {
      _modules[dependencyName].dependent =
        _modules[dependencyName].dependent || [];
      _modules[dependencyName].dependent.push(name);
    });
  });
}
